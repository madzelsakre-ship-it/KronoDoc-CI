import React, { useState, useMemo } from "react";
import {
  CATEGORIES,
  DOCUMENTS,
  SOUS_CATEGORIES,
} from "../lib/document-config";
import type { CategorieServices, DocType, DocumentType } from "../lib/document-config";

// Placeholder for navigation function
const navigateToService = (serviceId: DocumentType, actionType: string) => {
  console.log(`Navigating to service: ${serviceId} with action: ${actionType}`);
  // In a real app, you'd use react-router-dom's useNavigate or similar
  // For example: navigate(`/service/${serviceId}?action=${actionType}`);
};

const navigateToCategory = (categoryId: CategorieServices["id"]) => {
  console.log(`Navigating to category: ${categoryId}`);
  // For example: navigate(`/category/${categoryId}`);
};

/**
 * Un composant pour afficher un seul service avec un bouton d'action principal.
 */
const ServiceFeaturedItem: React.FC<{ service: DocType }> = ({ service }) => (
  <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex flex-col items-center text-center">
    <span className="text-4xl mb-2">{CATEGORIES.find(cat => cat.id === service.categorie)?.icon || '📄'}</span>
    <p className="font-semibold text-blue-800 mb-2">{service.label}</p>
    {service.actions.length > 0 && (
      <button
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => navigateToService(service.id, service.actions[0].type)}
        disabled={service.disabled || service.actions[0].disabled}
      >
        {service.actions[0].label}
      </button>
    )}
  </div>
);

/**
 * Le composant principal de la page d'accueil.
 * Affiche une barre de recherche globale, les services en vedette et la liste des catégories.
 */
export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const featuredServices = useMemo(() => {
    // IDs des services en vedette, comme dans le mockup
    const featuredIds: DocumentType[] = ["extrait_naissance", "cni_premiere_demande", "renouvellement_passeport"];
    return DOCUMENTS.filter(doc => featuredIds.includes(doc.id));
  }, []);

  const globalSearchResults = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return DOCUMENTS.filter(
      (doc) =>
        doc.label.toLowerCase().includes(lowerCaseSearchTerm) ||
        doc.descriptionCourte?.toLowerCase().includes(lowerCaseSearchTerm) ||
        CATEGORIES.find(cat => cat.id === doc.categorie)?.titre.toLowerCase().includes(lowerCaseSearchTerm) ||
        SOUS_CATEGORIES.find(subCat => subCat.id === doc.sousCategorie)?.titre.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doc CI</h1>
        <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200">
          Mon Profil
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Rechercher un service, un document (ex: CNI, naissance...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {searchTerm ? (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Résultats de recherche</h3>
          {globalSearchResults.length === 0 ? (
            <p className="p-4 text-gray-500">Aucun service trouvé pour "{searchTerm}".</p>
          ) : (
            globalSearchResults.map((service) => (
              <div key={service.id} className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{service.label}</p>
                  <p className="text-sm text-gray-500">
                    {CATEGORIES.find(cat => cat.id === service.categorie)?.titre}
                  </p>
                </div>
                {service.actions.length > 0 && (
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => navigateToService(service.id, service.actions[0].type)}
                    disabled={service.disabled || service.actions[0].disabled}
                  >
                    Accéder
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* SERVICES EN VEDETTE */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SERVICES EN VEDETTE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredServices.map((service) => (
                <ServiceFeaturedItem key={service.id} service={service} />
              ))}
            </div>
          </div>

          {/* TOUTES LES CATÉGORIES */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">TOUTES LES CATÉGORIES</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((categorie) => (
                <button
                  key={categorie.id}
                  className="bg-gray-100 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 text-left"
                  onClick={() => navigateToCategory(categorie.id)}
                  disabled={categorie.disabled}
                >
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    {categorie.icon && <span className="mr-2 text-2xl">{categorie.icon}</span>}
                    {categorie.titre}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{categorie.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};