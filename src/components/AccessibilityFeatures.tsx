import { Check, AlertCircle } from 'lucide-react'

interface AccessibilityInfo {
  description: string
  requirements: string
  features?: string[]
  restrictions?: string[]
}

interface AccessibilityFeaturesProps {
  accessibility: AccessibilityInfo
}

export function AccessibilityFeatures({ accessibility }: AccessibilityFeaturesProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{accessibility.description}</p>
      
      {accessibility.requirements && (
        <div className="space-y-2">
          <h3 className="font-medium">Requirements</h3>
          <p className="text-muted-foreground">{accessibility.requirements}</p>
        </div>
      )}

      {accessibility.features && accessibility.features.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Available Features</h3>
          <ul className="space-y-2">
            {accessibility.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {accessibility.restrictions && accessibility.restrictions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Restrictions</h3>
          <ul className="space-y-2">
            {accessibility.restrictions.map((restriction, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                {restriction}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 
