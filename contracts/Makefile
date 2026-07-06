SHELL := /bin/bash
CONTRACT := lucky_pool

# ── Default ──────────────────────────────────────────────────────────────────

default: build
all: fmt test build

# ── Build ────────────────────────────────────────────────────────────────────

# Requires Stellar CLI: cargo install --locked stellar-cli
build:
	stellar contract build

# Fallback if stellar CLI is not yet installed
# wasm32v1-none, not wasm32-unknown-unknown — see contracts/README.md Prerequisites.
build-cargo:
	cargo build --target wasm32v1-none --release

optimize: build
	stellar contract optimize \
	  --wasm target/wasm32-unknown-unknown/release/$(CONTRACT).wasm

# ── Test ─────────────────────────────────────────────────────────────────────

test:
	cargo test

test-verbose:
	cargo test -- --nocapture --test-threads=1

# ── Lint ─────────────────────────────────────────────────────────────────────

fmt:
	cargo fmt --all

clippy:
	cargo clippy --target wasm32v1-none -- -D warnings

# ── Deploy (testnet) ─────────────────────────────────────────────────────────
# Required env vars: SOURCE, ADMIN, USDC_ID, BLEND_ID, ORACLE_ID, FEE_BPS

deploy: optimize
	stellar contract deploy \
	  --wasm target/wasm32-unknown-unknown/release/$(CONTRACT).optimized.wasm \
	  --source-account $(SOURCE) \
	  --network testnet

initialize:
	stellar contract invoke \
	  --id $(CONTRACT_ID) \
	  --source-account $(SOURCE) \
	  --network testnet \
	  -- initialize \
	  --admin             $(ADMIN) \
	  --usdc              $(USDC_ID) \
	  --blend_pool        $(BLEND_ID) \
	  --oracle            $(ORACLE_ID) \
	  --protocol_fee_bps  $(FEE_BPS)

state:
	stellar contract invoke \
	  --id $(CONTRACT_ID) \
	  --network testnet \
	  -- get_pool_state

# ── Helpers ──────────────────────────────────────────────────────────────────

clean:
	cargo clean
