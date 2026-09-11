export default function PatientInfoPanel() {
  return (

    <div className="space-y-6 p-6">

      <h2 className="text-2xl font-bold">

        Patient Information

      </h2>

      <Section
        title="Patient"
        value="Rahul Sharma"
      />

      <Section
        title="Age"
        value="28 Years"
      />

      <Section
        title="Gender"
        value="Male"
      />

      <Section
        title="Reason"
        value="High Fever & Headache"
      />

      <Section
        title="Prescription"
        value="Not Added"
      />

      <Section
        title="Doctor Notes"
        value="Not Added"
      />

      <Section
        title="AI Summary"
        value="Waiting..."
      />

    </div>

  );
}

function Section({
  title,
  value,
}) {
  return (

    <div>

      <p className="text-gray-500 text-sm">

        {title}

      </p>

      <div className="border rounded-xl mt-2 p-4 bg-gray-50">

        {value}

      </div>

    </div>

  );
}