"use client";

import { Navbar } from "./Navbar";
import { useCurrentUser } from "@/hooks";

interface PublicLayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export function PublicLayout({ children, isAuthenticated = false }: PublicLayoutProps) {
  const currentUser = useCurrentUser();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isAuthenticated={isAuthenticated} user={currentUser || undefined} />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-primary"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span className="font-bold text-xl text-primary">Lar de Latas</span>
              </div>
              <p className="text-gray-600 text-sm">
                Ajudando animais a encontrarem um lar cheio de amor e responsabilidade.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-primary transition-colors">
                    Início
                  </a>
                </li>
                <li>
                  <a href="/animais" className="hover:text-primary transition-colors">
                    Animais para Adoção
                  </a>
                </li>
                <li>
                  <a href="/perdidos" className="hover:text-primary transition-colors">
                    Animais Perdidos
                  </a>
                </li>
                <li>
                  <a href="/animais/cadastrar" className="hover:text-primary transition-colors">
                    Cadastrar Animal
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: contato@lardelatas.com.br</li>
                <li>Telefone: (11) 9999-9999</li>
                <li>WhatsApp: (11) 99999-9999</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
            <p>&copy; 2026 Lar de Latas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
