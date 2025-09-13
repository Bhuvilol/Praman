import HeroSection from './HeroSection'
import RoleSelector from './RoleSelector'

function MainContent() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-12 py-4">
      <HeroSection />
      <RoleSelector />
    </main>
  )
}

export default MainContent
