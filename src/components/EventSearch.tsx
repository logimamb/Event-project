'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search, Calendar, X, Filter } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarComponent } from './ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { format } from 'date-fns'
import { useTranslations } from '@/lib/use-translations'
import { motion, AnimatePresence } from 'framer-motion'

interface EventSearchProps {
  onSearch: (params: SearchParams) => void
}

interface SearchParams {
  query: string
  dateRange?: DateRange
}

export function EventSearch({ onSearch }: EventSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>()
  const { t } = useTranslations()

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      dateRange,
    })
  }

  const handleClear = () => {
    setSearchQuery('')
    setDateRange(undefined)
    onSearch({ query: '' })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-12 transition-all duration-200 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 group-hover:border-primary/50"
            aria-label={t('search')}
          />
          <Search 
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors duration-200" 
            aria-hidden="true" 
          />
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="min-w-[240px] h-12 justify-start text-left font-normal border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label={t('dateRange')}
            >
              <Calendar className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span className="text-gray-500">{t('pickDate')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="rounded-lg"
              />
            </motion.div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label={t('search')}
        >
          <Search className="w-5 h-5 mr-2" aria-hidden="true" />
          {t('search')}
        </Button>

        {/* Clear Button */}
        <AnimatePresence>
          {(searchQuery || dateRange) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={handleClear}
                className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label={t('clearFilters')}
              >
                <X className="w-5 h-5 mr-2" aria-hidden="true" />
                {t('clearFilters')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(searchQuery || dateRange) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <Filter className="w-4 h-4" />
            <span>{t('activeFilters')}:</span>
            {searchQuery && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                {searchQuery}
              </span>
            )}
            {dateRange?.from && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                {format(dateRange.from, 'LLL dd, y')}
                {dateRange.to && ` - ${format(dateRange.to, 'LLL dd, y')}`}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 
