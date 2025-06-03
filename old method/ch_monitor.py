#!/usr/bin/env python3
import os
import time
import json
import logging
import requests
from dotenv import load_dotenv
from colorama import init as colorama_init, Fore, Style
from requests.auth import HTTPBasicAuth

# ─── Setup ─────────────────────────────────────────────────────────────────────
load_dotenv()
API_KEY        = os.getenv("CH_API_KEY")
COMPANY_NUMBER = os.getenv("COMPANY_NUMBER")
POLL_INTERVAL  = int(os.getenv("POLL_INTERVAL_SECONDS", "3600"))
CACHE_FILE     = f"{COMPANY_NUMBER}_cache.json"

# Initialize colorama
colorama_init(autoreset=True)

# Logging setup
logging.basicConfig(
    format="%(asctime)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO
)

# Optional Accept header
HEADERS = {"Accept": "application/json"}

# ─── Helpers ───────────────────────────────────────────────────────────────────
def fetch(endpoint: str) -> dict:
    """
    Fetches JSON data from Companies House API via HTTP Basic Auth.
    """
    url = f"https://api.company-information.service.gov.uk{endpoint}"
    resp = requests.get(
        url,
        headers=HEADERS,
        auth=HTTPBasicAuth(API_KEY, "")
    )
    resp.raise_for_status()
    return resp.json()


def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_cache(data: dict):
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def diff_lists(old: list, new: list, key_fn):
    """
    Compares two lists of dicts, returning items added and removed based on unique key_fn.
    """
    old_map = {key_fn(item): item for item in old}
    new_map = {key_fn(item): item for item in new}
    added = [v for k, v in new_map.items() if k not in old_map]
    removed = [v for k, v in old_map.items() if k not in new_map]
    return added, removed


def print_changes(title: str, added: list, removed: list, format_fn) -> bool:
    """Prints added/removed items under a heading. Returns True if any changes printed."""
    if not (added or removed):
        return False

    logging.info(f"--- {title} ---")
    if added:
        print(Fore.GREEN + "  Added:")
        for item in added:
            print("    " + format_fn(item))
    if removed:
        print(Fore.RED + "  Removed:")
        for item in removed:
            print("    " + format_fn(item))
    print(Style.RESET_ALL)
    return True

# ─── Core Check Logic ───────────────────────────────────────────────────────────
def check_for_changes():
    cache = load_cache()

    # Fetch current data
    officers = fetch(f"/company/{COMPANY_NUMBER}/officers")["items"]
    filings  = fetch(f"/company/{COMPANY_NUMBER}/filing-history")["items"]

    # Diff
    add_o, rem_o = diff_lists(
        cache.get("officers", []),
        officers,
        lambda o: o.get("links", {}).get("self")
    )
    add_f, rem_f = diff_lists(
        cache.get("filing_history", []),
        filings,
        lambda f: f.get("transaction_id")
    )

    # Print nicely and track if any changes
    changed = False
    if print_changes(
        f"Company {COMPANY_NUMBER}: Officer Changes",
        add_o, rem_o,
        lambda o: f"{o.get('name')} (appointed {o.get('appointed_on')})"
    ):
        changed = True
    if print_changes(
        f"Company {COMPANY_NUMBER}: Filing History Changes",
        add_f, rem_f,
        lambda f: f"{f.get('type')} on {f.get('date')}"
    ):
        changed = True

    # Update cache
    save_cache({
        "officers": officers,
        "filing_history": filings
    })
    return changed

# ─── Main Loop ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.info(
        f"Starting monitor for company {COMPANY_NUMBER}, polling every {POLL_INTERVAL}s"
    )

    # Track last time we printed a "no changes" message
    last_no_change = time.time()
    NO_CHANGE_INTERVAL = 600  # 10 minutes

    while True:
        try:
            if not check_for_changes():
                now = time.time()
                if now - last_no_change >= NO_CHANGE_INTERVAL:
                    print(Fore.YELLOW + f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] No changes detected.")
                    last_no_change = now
            else:
                # Reset timer when there are changes
                last_no_change = time.time()
        except Exception as e:
            logging.error(f"Error during check: {e}")
        time.sleep(POLL_INTERVAL)
