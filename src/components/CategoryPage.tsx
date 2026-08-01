import React, { useState, useMemo } from "react";
import {
  CATEGORIES,
  SOUS_CATEGORIES,
  DOCUMENTS,
} from "../lib/document-config";
import type { CategorieServices, DocType, DocumentType, ServiceAction } from "../lib/document-config";

// Placeholder for navigation function
const navigateToService = (serviceId: DocumentType, actionType: string) => {
  console.log(`Navigating to service: ${serviceId} with action: ${actionType}`);
  // In a real app, you'd use react-router-dom's useNavigate or similar
  // For example: navigate(`/service/${serviceId}?action=${actionType}`);
};

const navigateBack = () => {
  console.log("Navigating back to home");
  // For example: navigate('/');
};

interface CategoryPageProps {
  categoryId: CategorieServices["id"];
}

/**
 * Un composant pour afficher un seul service avec ses actions.
 */
const ServiceItemWithActions: React.FC<{ service: DocType }> = ({ service }) => (
  <div className="flex flex-col p-3 border-b border-gray-200 hover:bg-gray-50">
    <div className="flex justify-between items-center">
      <p className="font-semibold text-gray-800">• {service.label}</p>
      <div className="flex flex-wrap gap-2">
        {service.actions.map((action: ServiceAction, index: number) => (
          <button
            key={index}
            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigateToService(service.id, action.type)}
            disabled={service.disabled || action.disabled}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Le composant de la page de détail d'une catégorie.
 * Affiche les sous-catégories et les services associés.
 */
export const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Tout");

  const category = CATEGORIES.find((cat) => cat.id === categoryId);

  if (!category) {
    return <div className="p-4 text-red-500">Catégorie non trouvée.</div>;
  }

  const subCategoriesInThisCategory = SOUS_CATEGORIES.filter(
    (subCat) => subCat.categorieId === category.id,
  );

  const filteredServices = useMemo(() => {
    let services = DOCUMENTS.filter((doc) => doc.categorie === category.id);

    if (activeFilter !== "Tout") {
      services = services.filter(doc => doc.sousCategorie === activeFilter);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      services = services.filter(
        (doc) =>
          doc.label.toLowerCase().includes(lowerCaseSearchTerm) ||
          doc.descriptionCourte?.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }
    return services;
  }, [searchTerm, activeFilter, category.id, subCategoriesInThisCategory]);

  // Extract unique sub-category titles for filters
  const filterOptions = useMemo(() => {
    const filters = subCategoriesInThisCategory.map(sc => ({ id: sc.id, titre: sc.titre }));
    return [{ id: "Tout", titre: "Tout" }, ...filters];
  }, [subCategoriesInThisCategory]);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <button onClick={navigateBack} className="text-blue-600 hover:text-blue-800 mr-4">← Retour à l'accueil</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category.icon} {category.titre}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>
      </div>

      <input
        type="text"
        placeholder={`🔍 Rechercher dans ${category.titre}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Quick Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeFilter === filter.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.titre}
          </button>
        ))}
      </div>

      {/* Display Services Grouped by Sub-Category */}
      {subCategoriesInThisCategory.map((subCat) => {
        const servicesInSubCategory = filteredServices.filter(
          (doc) => doc.sousCategorie === subCat.id,
        );

        if (servicesInSubCategory.length === 0) return null;

        return (
          <div key={subCat.id} className="mt-6">
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              📌 {subCat.titre}
            </h3>
            <div>
              {servicesInSubCategory.map((service) => (
                <ServiceItemWithActions key={service.id} service={service} />
              ))}
            </div>
          </div>
        );
      })}
      {filteredServices.length === 0 && searchTerm && (
        <p className="p-4 text-gray-500">Aucun service trouvé pour "{searchTerm}" dans cette catégorie.</p>
      )}
    </div>
  );
};