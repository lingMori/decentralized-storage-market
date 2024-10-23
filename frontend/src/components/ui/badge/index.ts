import { type VariantProps, cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // 基础变体
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        
        // 文件处理状态
        pending:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        processing:
          'border-transparent bg-blue-500 text-white hover:bg-blue-600',
        completed:
          'border-transparent bg-green-500 text-white hover:bg-green-600',
        failed:
          'border-transparent bg-red-500 text-white hover:bg-red-600',
        
        // 用户连接状态
        online:
          'border-transparent bg-emerald-500 text-white hover:bg-emerald-600',
        offline:
          'border-transparent bg-gray-500 text-white hover:bg-gray-600',
        away:
          'border-transparent bg-amber-500 text-white hover:bg-amber-600',
        busy:
          'border-transparent bg-rose-500 text-white hover:bg-rose-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>