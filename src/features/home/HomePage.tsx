import { Button } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { PublicLayout } from "@/layouts";
import { AnimalCard, LoadingState } from "@/components";
import { useFilteredAnimals, useIsAuthenticated } from "@/hooks";

export function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  
  // Vitrine da home: primeira página dos pets disponíveis.
  const { data, isLoading } = useFilteredAnimals(
    { status: "Disponivel" },
    { page: 1, limit: 6 }
  );
  const featuredAnimals = data?.data ?? [];

  return (
    <PublicLayout isAuthenticated={isAuthenticated}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light/20 via-white to-secondary-light/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
                Encontre um novo{" "}
                <span className="text-primary">melhor amigo</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 text-balance">
                Ajude um animal a encontrar um lar cheio de carinho, cuidado e
                responsabilidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as={Link}
                  to="/animais"
                  size="lg"
                  color="primary"
                  className="font-semibold"
                >
                  Quero adotar
                </Button>
                <Button
                  as={Link}
                  to="/animais"
                  size="lg"
                  variant="bordered"
                  color="primary"
                  className="font-semibold"
                >
                  Ver todos os animais
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=800&fit=crop"
                  alt="Cachorro e gato juntos"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-light/20 p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-primary"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {featuredAnimals.length}+
                    </p>
                    <p className="text-sm text-gray-600">Animais disponíveis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Animals Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Animais esperando por um lar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça alguns dos animais que estão prontos para fazer parte da sua
              família
            </p>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredAnimals.map((animal) => (
                  <AnimalCard key={animal.id} animal={animal} />
                ))}
              </div>

              <div className="text-center">
                <Button
                  as={Link}
                  to="/animais"
                  size="lg"
                  color="primary"
                  variant="flat"
                >
                  Ver todos os animais
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Adotar um animal é simples e responsável
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary-light/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">01</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Encontre
              </h3>
              <p className="text-gray-600">
                Navegue pelos animais disponíveis para adoção e encontre aquele que
                se conecta com você.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary-light/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">02</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conheça
              </h3>
              <p className="text-gray-600">
                Veja todas as informações do animal, sua história e características
                importantes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary-light/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">03</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Adote</h3>
              <p className="text-gray-600">
                Demonstre interesse e acompanhe todo o processo de adoção
                responsável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perdeu seu animal de estimação?
          </h2>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Cadastre seu animal perdido e ajude a comunidade a encontrá-lo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/perdidos"
              size="lg"
              className="bg-white text-primary font-semibold"
            >
              Ver animais perdidos
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
