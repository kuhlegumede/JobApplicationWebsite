import { JobSeekerHeader } from "../../components/JobSeekerHeader";
import AssessmentDetail from "../../components/AssessmentDetail";
import AssessmentList from "../../components/AssessmentList";
import { Footer } from "../../components/Footer";
import { useState } from "react";
export function JobSeekerAssessment() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="background">
        <JobSeekerHeader />
        <div className="container my-4">
          <div id="card-container" className="card shadow p-4 card-container">
            <div className="h-screen">
              {!selected ? (
                <AssessmentList onSelect={setSelected} />
              ) : (
                <AssessmentDetail
                  assessment={selected}
                  onBack={() => setSelected(null)}
                />
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
