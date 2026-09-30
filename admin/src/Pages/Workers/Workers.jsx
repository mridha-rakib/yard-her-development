import React, { useEffect, useState } from "react";
import { message } from "antd";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  formatAvailability,
  formatLocation,
  formatHeroStatus,
  getInitials,
  getHeroStatusClasses,
} from "../../lib/workers";

const ITEMS_PER_PAGE = 5;
const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
};

const Heroes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [Heroes, setHeroes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let ignore = false;

    const loadHeroFilters = async () => {
      setIsMetaLoading(true);

      try {
        const data = await adminApi.getHeroFilters();

        if (!ignore) {
          setSkills(data.skills || []);
        }
      } catch (apiError) {
        if (!ignore) {
          message.error(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsMetaLoading(false);
        }
      }
    };

    loadHeroFilters();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadHeroes = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (skillFilter !== "all") {
          params.skill = skillFilter;
        }

        const response = await adminApi.listHeroes(params);

        if (!ignore) {
          setHeroes(response.items);
          setPagination(response.pagination);
        }
      } catch (apiError) {
        if (!ignore) {
          setHeroes([]);
          setPagination((current) => ({ ...current, total: 0, totalPages: 1 }));
          setError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadHeroes();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearchTerm, skillFilter, statusFilter]);

  const handleViewHero = (workerId) => {
    navigate(`/workers/${workerId}`);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSkillsChange = (event) => {
    setSkillFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const totalPages = pagination.totalPages || 1;
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen p-6 mt-16 bg-gray-50">
      <div className="mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Heroes Management</h1>

        <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by Hero name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={skillFilter}
              onChange={handleSkillsChange}
              disabled={isMetaLoading}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="all">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Hero
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Age
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading Heroes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : Heroes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No Heroes found
                    </td>
                  </tr>
                ) : (
                  Heroes.map((worker) => (
                    <tr key={worker._id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">
                            {getInitials(worker.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                            <div className="text-xs text-gray-500 truncate">{worker.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{worker.age || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatLocation(worker.location)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {worker.location?.zipCode || "No ZIP"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(worker.skills || []).length ? (
                            worker.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No skills listed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatAvailability(worker.availability)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-medium ${getHeroStatusClasses(
                            worker.workerStatus
                          )}`}
                        >
                          {formatHeroStatus(worker.workerStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewHero(worker._id)}
                          className="p-1 text-gray-600 transition hover:text-gray-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {showingFrom} to {showingTo} of {pagination.total} results
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 transition border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const shouldRenderGap = previousPage && page - previousPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {shouldRenderGap ? <span className="px-2">...</span> : null}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-9 h-9 rounded-md text-sm transition ${
                          currentPage === page
                            ? "bg-green-700 text-white font-medium hover:bg-green-800"
                            : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 transition border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Heroes;
