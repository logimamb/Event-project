import {
  Loader2,
  CreditCard,
  Wallet,
  DollarSign,
  type Icon as LucideIcon,
} from 'lucide-react'

export type Icon = LucideIcon

export const Icons = {
  spinner: Loader2,
  stripe: DollarSign,
  paypal: Wallet,
  creditCard: CreditCard,
} 