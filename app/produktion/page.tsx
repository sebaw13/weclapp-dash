import WipRoestkaffeeForecast from '../components/WipRoestkaffeeForecast'
import WipRoestkaffeeBedarfsliste from '../components/WipRoestkaffeeBedarfsliste'

export default function ProduktionPage() {
  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Produktionsplanung</h1>
      <p className="text-muted-foreground mb-6">Plane und optimiere deine Produktionsprozesse.</p>

      {/* Verbrauch WIP-Röstkaffee */}
      <WipRoestkaffeeForecast />

      {/* Produktionsbedarf WIP-Röstkaffee */}
      <WipRoestkaffeeBedarfsliste />
    </div>
  )
}
