//! A minimal mock of the Blend v2 Pool contract for unit tests — implements
//! just enough of `blend::Pool` (see blend.rs) to exercise LuckyPool's
//! deposit/withdraw/harvest_yield flows, including a `set_b_rate` test hook
//! to simulate interest accrual.
#![cfg(test)]

use crate::blend::{
    Positions, Request, Reserve, ReserveConfig, ReserveData, Pool, REQUEST_TYPE_SUPPLY,
    REQUEST_TYPE_WITHDRAW, SCALAR_12,
};
use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    contract, contractimpl, contracttype, token, Address, Env, IntoVal, Map, Symbol, Val, Vec,
};

const RESERVE_INDEX: u32 = 0;

#[contracttype]
enum DataKey {
    Usdc,
    BRate,
    Positions(Address),
}

#[contract]
pub struct MockBlendPool;

impl MockBlendPool {
    fn b_rate(env: &Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::BRate)
            .unwrap_or(SCALAR_12)
    }

    fn usdc(env: &Env) -> Address {
        env.storage().instance().get(&DataKey::Usdc).unwrap()
    }

    fn positions_of(env: &Env, who: &Address) -> Positions {
        env.storage()
            .instance()
            .get(&DataKey::Positions(who.clone()))
            .unwrap_or(Positions {
                liabilities: Map::new(env),
                collateral: Map::new(env),
                supply: Map::new(env),
            })
    }

    /// Self-authorize a token call this mock is about to make on its own
    /// behalf (Soroban never auto-satisfies a contract's own require_auth,
    /// even for direct calls) — mirrors what Blend's real, audited pool
    /// contract does internally around its own token transfers.
    fn authorize_token_call(env: &Env, token: &Address, fn_name: &str, args: Vec<Val>) {
        env.authorize_as_current_contract(Vec::from_array(
            env,
            [InvokerContractAuthEntry::Contract(SubContractInvocation {
                context: ContractContext {
                    contract: token.clone(),
                    fn_name: Symbol::new(env, fn_name),
                    args,
                },
                sub_invocations: Vec::new(env),
            })],
        ));
    }
}

#[contractimpl]
impl MockBlendPool {
    pub fn init(env: Env, usdc: Address) {
        env.storage().instance().set(&DataKey::Usdc, &usdc);
        env.storage().instance().set(&DataKey::BRate, &SCALAR_12);
    }

    /// Test-only: simulate interest accrual by bumping the exchange rate.
    /// The test must separately fund this contract with the extra underlying
    /// so the increased redemption value can actually be paid out.
    pub fn set_b_rate(env: Env, new_rate: i128) {
        env.storage().instance().set(&DataKey::BRate, &new_rate);
    }
}

#[contractimpl]
impl Pool for MockBlendPool {
    fn submit(
        env: Env,
        from: Address,
        spender: Address,
        to: Address,
        requests: Vec<Request>,
    ) -> Positions {
        let usdc = Self::usdc(&env);
        let token_client = token::Client::new(&env, &usdc);
        let this = env.current_contract_address();
        let rate = Self::b_rate(&env);
        let mut pos = Self::positions_of(&env, &from);
        let mut b_tokens = pos.supply.get(RESERVE_INDEX).unwrap_or(0);

        for req in requests.iter() {
            if req.request_type == REQUEST_TYPE_SUPPLY {
                // Direct transfer: the caller (spender) must have already
                // self-authorized this exact call, same as a real pool would
                // require of an integrator using plain `submit`.
                token_client.transfer(&spender, &this, &req.amount);
                b_tokens += req.amount * SCALAR_12 / rate;
            } else if req.request_type == REQUEST_TYPE_WITHDRAW {
                let burned = (req.amount * SCALAR_12 + rate - 1) / rate; // ceil
                b_tokens -= burned;
                Self::authorize_token_call(
                    &env,
                    &usdc,
                    "transfer",
                    (this.clone(), to.clone(), req.amount).into_val(&env),
                );
                token_client.transfer(&this, &to, &req.amount);
            } else {
                panic!("unsupported request type in mock blend pool");
            }
        }

        pos.supply.set(RESERVE_INDEX, b_tokens);
        env.storage().instance().set(&DataKey::Positions(from), &pos);
        pos
    }

    fn submit_with_allowance(
        env: Env,
        from: Address,
        spender: Address,
        to: Address,
        requests: Vec<Request>,
    ) -> Positions {
        let usdc = Self::usdc(&env);
        let token_client = token::Client::new(&env, &usdc);
        let this = env.current_contract_address();
        let rate = Self::b_rate(&env);
        let mut pos = Self::positions_of(&env, &from);
        let mut b_tokens = pos.supply.get(RESERVE_INDEX).unwrap_or(0);

        for req in requests.iter() {
            if req.request_type == REQUEST_TYPE_SUPPLY {
                // Consumes the allowance `spender` (this mock) was already
                // granted via token.approve(from, spender, ...).
                Self::authorize_token_call(
                    &env,
                    &usdc,
                    "transfer_from",
                    (this.clone(), spender.clone(), this.clone(), req.amount).into_val(&env),
                );
                token_client.transfer_from(&this, &spender, &this, &req.amount);
                b_tokens += req.amount * SCALAR_12 / rate;
            } else if req.request_type == REQUEST_TYPE_WITHDRAW {
                let burned = (req.amount * SCALAR_12 + rate - 1) / rate; // ceil
                b_tokens -= burned;
                Self::authorize_token_call(
                    &env,
                    &usdc,
                    "transfer",
                    (this.clone(), to.clone(), req.amount).into_val(&env),
                );
                token_client.transfer(&this, &to, &req.amount);
            } else {
                panic!("unsupported request type in mock blend pool");
            }
        }

        pos.supply.set(RESERVE_INDEX, b_tokens);
        env.storage().instance().set(&DataKey::Positions(from), &pos);
        pos
    }

    fn get_positions(env: Env, address: Address) -> Positions {
        Self::positions_of(&env, &address)
    }

    fn get_reserve(env: Env, asset: Address) -> Reserve {
        Reserve {
            asset,
            config: ReserveConfig {
                index: RESERVE_INDEX,
                decimals: 7,
                c_factor: 0,
                l_factor: 0,
                util: 0,
                max_util: 0,
                r_base: 0,
                r_one: 0,
                r_two: 0,
                r_three: 0,
                reactivity: 0,
                supply_cap: 0,
                enabled: true,
            },
            data: ReserveData {
                d_rate: SCALAR_12,
                b_rate: Self::b_rate(&env),
                ir_mod: 0,
                b_supply: 0,
                d_supply: 0,
                backstop_credit: 0,
                last_time: 0,
            },
            scalar: 10_000_000,
        }
    }
}
