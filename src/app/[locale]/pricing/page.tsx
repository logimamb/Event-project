import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const t = useTranslations('Index');

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-6">{t('pricing.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <h3 className="text-2xl font-bold mb-2">{t('pricing.free.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('pricing.free.description')}</p>
          <p className="text-3xl font-bold mb-6">{t('pricing.free.price')}</p>
          <ul className="space-y-3 mb-8">
            {['limit1', 'limit2', 'limit3', 'limit4'].map((item) => (
              <li key={item} className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>{t(`pricing.free.features.${item}`)}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full">{t('pricing.free.button')}</Button>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-8 rounded-xl border border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all duration-300 relative"
        >
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
              {t('pricing.popular')}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">{t('pricing.pro.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('pricing.pro.description')}</p>
          <p className="text-3xl font-bold mb-6">{t('pricing.pro.price')}</p>
          <ul className="space-y-3 mb-8">
            {['limit1', 'limit2', 'limit3', 'limit4', 'limit5'].map((item) => (
              <li key={item} className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>{t(`pricing.pro.features.${item}`)}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full bg-gradient-to-r from-primary to-violet-500 text-white">
            {t('pricing.pro.button')}
          </Button>
        </motion.div>

        {/* Enterprise Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <h3 className="text-2xl font-bold mb-2">{t('pricing.enterprise.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('pricing.enterprise.description')}</p>
          <p className="text-3xl font-bold mb-6">{t('pricing.enterprise.price')}</p>
          <ul className="space-y-3 mb-8">
            {['limit1', 'limit2', 'limit3', 'limit4', 'limit5', 'limit6'].map((item) => (
              <li key={item} className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>{t(`pricing.enterprise.features.${item}`)}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" variant="outline">
            {t('pricing.enterprise.button')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
