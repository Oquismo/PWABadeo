/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Esta es la clave: excluir las rutas API del análisis estático
  async generateBuildId() {
    return 'build-' + Date.now()
  },
  
  // Configurar qué páginas se deben generar estáticamente
  async exportPathMap(defaultPathMap) {
    // Excluir todas las rutas API del mapa de paths
    const pathMap = {}
    for (const [path, page] of Object.entries(defaultPathMap)) {
      if (!path.startsWith('/api/')) {
        pathMap[path] = page
      }
    }
    return pathMap
  }
}

export default nextConfig
