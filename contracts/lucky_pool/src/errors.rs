use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LuckyPoolError {
    AlreadyInitialized  = 1,
    NotInitialized      = 2,
    Paused              = 3,
    Unauthorized        = 4,
    InsufficientBalance = 5,
    InsufficientPrize   = 6,
    InvalidAmount       = 7,
    NoDepositors        = 8,
    FeeTooHigh          = 9,
    DrawAlreadyRequested = 10,
    DrawNotRequested     = 11,
    NoTickets            = 12,
}
