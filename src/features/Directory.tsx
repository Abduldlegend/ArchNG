import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { architects } from "../data";
import { useApp } from "../context/context";
import { ArchitectCard } from "../components/cards";
import { PageHeader } from "../components/layout";
import {
  Badge,
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  Field,
  Icon,
  Input,
  LinkButton,
  Select,
} from "../components/ui";

const states = ["Lagos", "Abuja FCT", "Rivers", "Oyo", "Enugu", "Osun"];
const typologies = ["Private Residence", "Civic / Institutional", "Hospitality", "Cultural", "Commercial"];
const feeTiers = ["₦50m+", "₦80m+", "₦100m+", "₦150m+", "₦250m+", "₦300m+"];

function FilterControls({
  query,
  setQuery,
  state,
  setState,
  typology,
  setTypology,
  fee,
  setFee,
  experience,
  setExperience,
}: {
  query: string;
  setQuery: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  typology: string;
  setTypology: (value: string) => void;
  fee: string;
  setFee: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Search directory">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Firm, architect, or specialty"
            className="pl-11"
          />
        </div>
      </Field>
      <Field label="State / chapter">
        <Select value={state} onChange={(event) => setState(event.target.value)}>
          <option value="">All territories</option>
          {states.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Typology">
        <Select value={typology} onChange={(event) => setTypology(event.target.value)}>
          <option value="">All typologies</option>
          {typologies.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Commission fee tier">
        <Select value={fee} onChange={(event) => setFee(event.target.value)}>
          <option value="">Any fee tier</option>
          {feeTiers.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Experience">
        <Select value={experience} onChange={(event) => setExperience(event.target.value)}>
          <option value="">Any experience</option>
          <option value="10">10+ years</option>
          <option value="15">15+ years</option>
          <option value="20">20+ years</option>
        </Select>
      </Field>
      <div className="rounded-lg border border-hairline bg-surface-low p-4">
        <div className="flex items-center gap-2 text-label text-ink">
          <Icon name="verified_user" className="text-[18px] text-verified" />
          ARCON checks current
        </div>
        <p className="mt-2 text-body-sm text-stone">
          All listed practices hold a valid 2026 Form B practising licence.
        </p>
      </div>
    </div>
  );
}

export function Directory() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const typology = params.get("typology") ?? "";
  const [fee, setFee] = useState("");
  const [experience, setExperience] = useState("");
  const [sort, setSort] = useState("curated");
  const [filterOpen, setFilterOpen] = useState(false);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = architects.filter((architect) => {
      const matchesQuery =
        !term ||
        [architect.name, architect.firm, architect.city, ...architect.specialties]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesState = !state || architect.state === state;
      const matchesTypology =
        !typology ||
        architect.specialties.some((specialty) => specialty.toLowerCase().includes(typology.split(" ")[0].toLowerCase())) ||
        (typology === "Private Residence" && architect.specialties.includes("Small Residential"));
      const matchesFee = !fee || architect.feeTier === fee;
      const matchesExperience = !experience || architect.years >= Number(experience);
      return matchesQuery && matchesState && matchesTypology && matchesFee && matchesExperience;
    });
    if (sort === "experience") return [...result].sort((a, b) => b.years - a.years);
    if (sort === "name") return [...result].sort((a, b) => a.firm.localeCompare(b.firm));
    return result;
  }, [query, state, typology, fee, experience, sort]);

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true });
    setFee("");
    setExperience("");
  };

  const activeFilters = [query, state, typology, fee, experience].filter(Boolean).length;

  const controls = (
    <FilterControls
      query={query}
      setQuery={(value) => updateParam("q", value)}
      state={state}
      setState={(value) => updateParam("state", value)}
      typology={typology}
      setTypology={(value) => updateParam("typology", value)}
      fee={fee}
      setFee={setFee}
      experience={experience}
      setExperience={setExperience}
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="Verified architect directory"
        title="Credentialed practices across Nigeria"
        description="A statutory catalogue of ARCON-registered studios. Filter by chapter, typology, fee tier, and experience, then open a monograph or request a video consultation."
        action={
          <div className="flex items-center gap-3">
            <Badge tone="verified">
              <Icon name="verified" filled className="text-[14px]" />
              2026 licences current
            </Badge>
            <span className="text-body-sm text-stone tnum">{architects.length} studios listed</span>
          </div>
        }
      />

      <section className="py-10 md:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-headline-sm text-ink">Refine</h2>
                {activeFilters > 0 && (
                  <button type="button" onClick={reset} className="text-body-sm text-terracotta hover:underline">
                    Reset
                  </button>
                )}
              </div>
              {controls}
            </Card>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-sm text-stone">
                  <strong className="font-medium text-ink tnum">{filtered.length}</strong> results
                </span>
                {query && <Chip active onClick={() => updateParam("q", "")}>{query} ×</Chip>}
                {state && <Chip active onClick={() => updateParam("state", "")}>{state} ×</Chip>}
                {typology && <Chip active onClick={() => updateParam("typology", "")}>{typology} ×</Chip>}
                {fee && <Chip active onClick={() => setFee("")}>{fee} ×</Chip>}
                {experience && <Chip active onClick={() => setExperience("")}>{experience}+ yrs ×</Chip>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setFilterOpen(true)}>
                  <Icon name="tune" className="text-[16px]" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] text-white">
                      {activeFilters}
                    </span>
                  )}
                </Button>
                <label className="flex items-center gap-2 text-body-sm text-stone">
                  <span className="hidden sm:inline">Sort</span>
                  <Select value={sort} onChange={(event) => setSort(event.target.value)} className="h-9 min-w-36">
                    <option value="curated">Curated order</option>
                    <option value="experience">Most experienced</option>
                    <option value="name">Firm name</option>
                  </Select>
                </label>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((architect) => (
                  <ArchitectCard key={architect.id} architect={architect} />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No practices match this brief"
                  description="Try removing a filter or searching a broader location. The directory only lists currently verified ARCON practices."
                  action={
                    <Button onClick={reset}>
                      Reset all filters
                      <Icon name="restart_alt" className="text-[17px]" />
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Refine the directory"
        subtitle="Filters apply immediately"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={reset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setFilterOpen(false)}>
              Show {filtered.length} results
            </Button>
          </div>
        }
      >
        {controls}
      </Dialog>
    </>
  );
}

export function SavedPractices() {
  const { saved } = useApp();
  const savedArchitects = architects.filter((architect) => saved.includes(architect.slug));

  return (
    <>
      <PageHeader
        eyebrow="Your archive"
        title="Saved practices"
        description="A private reading list of studios and monographs. Saved practices stay on this device until you remove them."
        action={<Badge>{savedArchitects.length} saved</Badge>}
      />
      <section className="py-10 md:py-14">
        <div className="container-page">
          {savedArchitects.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedArchitects.map((architect) => (
                <ArchitectCard key={architect.id} architect={architect} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="bookmark_border"
              title="Your archive is empty"
              description="Open any practice monograph and select “Save architect” to keep it here for later."
              action={
                <LinkButton to="/architects">
                  Browse the directory
                  <Icon name="arrow_forward" className="text-[16px]" />
                </LinkButton>
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
