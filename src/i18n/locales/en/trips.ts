import type { Interest } from '@/types/trip'

export const trips = {
  list: {
    title: 'My trips',
    newTrip: 'New trip',
    empty: 'No trips yet. Add one to get started!',
    budget: 'Budget: {{amount}}',
  },
  newTrip: {
    title: 'New trip',
  },
  detail: {
    notFoundTitle: 'Trip not found',
    notFoundDescription:
      "The trip you're looking for doesn't exist or has been removed.",
    back: 'Back to trips',
    budget: 'Budget: {{amount}}',
    interests: 'Interests',
    noInterests: 'No interests selected.',
  },
  form: {
    title: 'Trip details',
    destination: 'Destination',
    startDate: 'Start date',
    endDate: 'End date',
    budget: 'Budget (€)',
    interests: 'Interests',
    submit: 'Add trip',
    errors: {
      destinationRequired: 'Destination is required.',
      startDateRequired: 'Start date is required.',
      endDateRequired: 'End date is required.',
      endDateBeforeStart: 'End date cannot be before the start date.',
      budgetPositive: 'Budget must be greater than 0.',
    },
  },
  // One label per `Interest` value: `satisfies` makes a missing or unknown
  // interest a compile error. The stored values ('cultura', …) never change.
  interests: {
    cultura: 'Culture',
    cibo: 'Food',
    natura: 'Nature',
    relax: 'Relax',
    nightlife: 'Nightlife',
  } satisfies Record<Interest, string>,
} as const

// Keys of the validation messages: `validate()` returns these keys and the
// component translates them, so validation logic stays language-independent.
export type ValidationErrorKey = keyof typeof trips.form.errors
