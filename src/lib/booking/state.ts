export type BookingStatus = 'requested' | 'approved' | 'declined' | 'paid' | 'active' | 'completed' | 'cancelled' | 'no_show' | 'disputed';

export interface BookingState {
  status: BookingStatus;
  renterId: string;
  chargerId: string;
  startTime: Date;
  endTime: Date;
}

export interface TransitionResult {
  success: boolean;
  newStatus?: BookingStatus;
  error?: string;
}

export const BookingStateMachine = {
  transitions: {
    requested: {
      approved: {
        guard: (state: BookingState, context: any) => {
          if (!context.renterKycVerified) return { success: false, error: 'Renter must be KYC verified' };
          if (!context.isCompatible) return { success: false, error: 'Vehicle is not compatible with charger' };
          if (!context.isAvailable) return { success: false, error: 'Slot is no longer available' };
          if (context.exceedsLoadLimit) return { success: false, error: 'Society load limit exceeded' };
          return { success: true };
        },
        target: 'approved',
      },
      declined: {
        guard: () => ({ success: true }),
        target: 'declined',
      },
    },
    approved: {
      paid: {
        guard: (state: BookingState, context: any) => {
          if (!context.paymentConfirmed) return { success: false, error: 'Payment not confirmed' };
          return { success: true };
        },
        target: 'paid',
      },
      cancelled: {
        guard: () => ({ success: true }),
        target: 'cancelled',
      },
    },
    paid: {
      active: {
        guard: (state: BookingState, context: any) => {
          const now = new Date();
          const start = new Date(state.startTime);
          const buffer = 15 * 60 * 1000; // 15 min grace
          if (now < new Date(start.getTime() - buffer)) {
            return { success: false, error: 'Too early to start session' };
          }
          return { success: true };
        },
        target: 'active',
      },
      cancelled: {
        guard: () => ({ success: true }), // Refund logic handled separately
        target: 'cancelled',
      },
    },
    active: {
      completed: {
        guard: (state: BookingState, context: any) => {
          if (!context.meterReadingEnd) return { success: false, error: 'End meter reading required' };
          return { success: true };
        },
        target: 'completed',
      },
      disputed: {
        guard: () => ({ success: true }),
        target: 'disputed',
      },
    },
    completed: {
      // Terminal state
    },
  } as Record<string, Record<string, { guard: (state: BookingState, context: any) => any, target: BookingStatus }>>,

  transition(state: BookingState, action: string, context: any): TransitionResult {
    const currentStatus = state.status;
    const availableActions = this.transitions[currentStatus];

    if (!availableActions || !availableActions[action]) {
      return { success: false, error: `Invalid transition ${action} from ${currentStatus}` };
    }

    const { guard, target } = availableActions[action];
    const guardResult = guard(state, context);

    if (!guardResult.success) {
      return { success: false, error: guardResult.error };
    }

    return { success: true, newStatus: target };
  },
};
