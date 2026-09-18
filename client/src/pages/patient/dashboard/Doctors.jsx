import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Stethoscope,
  Building2,
  Award,
  Loader2,
  Calendar,
  X,
  Filter,
  ArrowRight,
  Star,
  ArrowUpDown,
  SlidersHorizontal,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/api/axios";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currencySign, formatPrice } = useCurrency();
  const [dbSpecializations, setDbSpecializations] = useState([]);

  const [search, setSearch] = useState("");
  const urlSpecialization = searchParams.get("specialization") || "";
  const [specialization, setSpecialization] = useState(urlSpecialization);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "default");

  useEffect(() => {
    api
      .get("/specializations")
      .then(({ data }) => {
        if (data?.data) {
          setDbSpecializations(data.data.map((s) => s.name));
        }
      })
      .catch((err) => console.error("Failed to load specializations:", err));
  }, []);

  const sortOptions = useMemo(
    () => [
      { value: "default", label: "Default (Recommended)", icon: SlidersHorizontal },
      { value: "name-asc", label: "Name: A to Z", icon: ArrowDownNarrowWide },
      { value: "name-desc", label: "Name: Z to A", icon: ArrowUpNarrowWide },
      { value: "rating-desc", label: "Rating: High to Low", icon: Star },
      { value: "rating-asc", label: "Rating: Low to High", icon: Star },
      { value: "price-asc", label: `Price: Low to High (${currencySign})`, icon: null },
      { value: "price-desc", label: `Price: High to Low (${currencySign})`, icon: null },
    ],
    [currencySign]
  );

  // Keep local `specialization` in sync with the URL (e.g. browser back/
  // forward), adjusted during render instead of via an effect.
  const [appliedUrlSpecialization, setAppliedUrlSpecialization] = useState(urlSpecialization);
  if (urlSpecialization && urlSpecialization !== appliedUrlSpecialization) {
    setAppliedUrlSpecialization(urlSpecialization);
    setSpecialization(urlSpecialization);
  }

  const { data: doctors = [], isLoading: loading } = useQuery({
    queryKey: ["patient-doctors-list"],
    queryFn: async () => {
      const res = await api.get("/doctors");
      return res.data?.data || [];
    },
    meta: { onError: (err) => console.error("Failed to load doctors:", err) },
  });

  const handleSpecializationChange = (newSpec) => {
    setSpecialization(newSpec);
    updateSearchParams(newSpec, sortBy);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    updateSearchParams(specialization, newSort);
  };

  const updateSearchParams = (spec, sort) => {
    const params = {};
    if (spec) params.specialization = spec;
    if (sort && sort !== "default") params.sort = sort;
    setSearchParams(params);
  };

  const specializations = useMemo(() => {
    const specs = [
      ...dbSpecializations,
      ...doctors.map((d) => d.specialization).filter(Boolean),
    ];
    return [...new Set(specs)];
  }, [dbSpecializations, doctors]);

  const filteredDoctors = useMemo(() => {
    // 1. Filter
    let result = doctors.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      const hospitalName = (doctor.hospital || "").toLowerCase();
      const docSpec = (doctor.specialization || "").toLowerCase();
      const term = search.toLowerCase().trim();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        hospitalName.includes(term) ||
        docSpec.includes(term);

      let matchesSpecialization = true;
      if (specialization) {
        const specFilter = specialization.toLowerCase().trim();
        const rootTerm = specFilter
          .replace("cardiology", "cardio")
          .replace("dermatology", "derma")
          .replace("pediatrics", "pediatric")
          .replace("neurology", "neuro")
          .replace("orthopedics", "ortho")
          .replace("general medicine", "general");

        matchesSpecialization =
          docSpec.includes(specFilter) ||
          specFilter.includes(docSpec) ||
          docSpec.includes(rootTerm);
      }

      return matchesSearch && matchesSpecialization;
    });

    // 2. Sort
    result.sort((a, b) => {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
      const ratingA = Number(a.averageRating ?? a.rating ?? 5.0);
      const ratingB = Number(b.averageRating ?? b.rating ?? 5.0);
      const priceA = Number(a.consultationFee ?? 500);
      const priceB = Number(b.consultationFee ?? 500);

      switch (sortBy) {
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "name-desc":
          return nameB.localeCompare(nameA);
        case "rating-desc":
          return ratingB - ratingA;
        case "rating-asc":
          return ratingA - ratingB;
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        default:
          return 0;
      }
    });

    return result;
  }, [doctors, search, specialization, sortBy]);

  const activeSortLabel = useMemo(() => {
    return sortOptions.find((s) => s.value === sortBy)?.label || "Default";
  }, [sortBy, sortOptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Find Certified Doctors
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Book virtual consultations, video visits, and receive digital prescriptions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {specialization && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Specialty: <span>{specialization}</span>
              <button
                onClick={() => handleSpecializationChange("")}
                className="ml-1 hover:bg-blue-200 p-0.5 rounded-full text-blue-700 transition cursor-pointer"
                title="Clear Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {sortBy !== "default" && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              Sorted: <span>{activeSortLabel}</span>
              <button
                onClick={() => handleSortChange("default")}
                className="ml-1 hover:bg-indigo-200 p-0.5 rounded-full text-indigo-700 transition cursor-pointer"
                title="Reset Sort"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search doctor by name, hospital, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-slate-50 border-slate-200 text-xs sm:text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Specialty Dropdown */}
          <div className="w-full sm:w-60">
            <select
              value={specialization}
              onChange={(e) => handleSpecializationChange(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition cursor-pointer"
            >
              <option value="">All Specializations ({doctors.length})</option>
              {specializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full sm:w-64">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition cursor-pointer appearance-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Filter & Sort Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {/* Quick Specialty Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Specialties:
            </span>
            <button
              onClick={() => handleSpecializationChange("")}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                !specialization
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecializationChange(spec)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                  specialization === spec ||
                  (specialization &&
                    spec.toLowerCase().includes(specialization.toLowerCase()))
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Quick Sort Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Sort:
            </span>
            <button
              onClick={() => handleSortChange(sortBy === "rating-desc" ? "default" : "rating-desc")}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                sortBy === "rating-desc"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> Top Rated
            </button>
            <button
              onClick={() => handleSortChange(sortBy === "price-asc" ? "default" : "price-asc")}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                sortBy === "price-asc"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="font-semibold">{currencySign}</span> Price: Low → High
            </button>
            <button
              onClick={() => handleSortChange(sortBy === "price-desc" ? "default" : "price-desc")}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                sortBy === "price-desc"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="font-semibold">{currencySign}</span> Price: High → Low
            </button>
            <button
              onClick={() => handleSortChange(sortBy === "name-asc" ? "default" : "name-asc")}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                sortBy === "name-asc"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Name (A-Z)
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 font-bold">{filteredDoctors.length}</strong> of {doctors.length} verified physicians
        </span>
        {sortBy !== "default" && (
          <span className="text-blue-600 font-medium">
            Sorted by {activeSortLabel}
          </span>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-16 bg-white rounded-3xl">
          <CardContent className="space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No doctors found matching your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search term, specialty filter, or sorting options.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                handleSpecializationChange("");
                handleSortChange("default");
              }}
              className="text-xs rounded-xl cursor-pointer"
            >
              Clear All Filters & Reset Sort
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor._id}
              className="border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition p-6 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Doctor Avatar & Status */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      doctor.profileImage ||
                      `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=2563eb&color=ffffff`
                    }
                    alt={doctor.firstName}
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-blue-50 text-blue-700 font-bold uppercase tracking-wider truncate max-w-[130px]"
                      >
                        {doctor.specialization || "General Physician"}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {doctor.averageRating ? Number(doctor.averageRating).toFixed(1) : "5.0"}
                        <span className="text-[10px] font-normal text-slate-400">
                          ({doctor.totalReviews || 0})
                        </span>
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {doctor.qualification || "MBBS, MD"}
                    </p>
                  </div>
                </div>

                {/* Bio / Summary */}
                {doctor.biography && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doctor.biography}
                  </p>
                )}

                {/* Details Pills */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doctor.hospital || "TeleClinic Virtual Hospital"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{doctor.experience || 5}+ Years Practice</span>
                    </div>
                    <div className="flex items-center text-slate-900 font-black text-sm">
                      {formatPrice(doctor.consultationFee ?? 500)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">/ session</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Appointment CTA */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <Link to={`/patient/doctors/${doctor._id}`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 text-xs gap-1.5 shadow-md shadow-blue-200">
                    <Calendar className="w-3.5 h-3.5" /> Book Consultation <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}