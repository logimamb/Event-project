import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
  const t = useTranslations('Index');

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-6">{t('features')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('features.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold mb-4">{t('features.smartScheduling.title')}</h3>
          <p className="text-muted-foreground">{t('features.smartScheduling.description')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold mb-4">{t('features.globalReach.title')}</h3>
          <p className="text-muted-foreground">{t('features.globalReach.description')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold mb-4">{t('features.instantAnalytics.title')}</h3>
          <p className="text-muted-foreground">{t('features.instantAnalytics.description')}</p>
        </motion.div>
      </div>
    </div>
  );
}
