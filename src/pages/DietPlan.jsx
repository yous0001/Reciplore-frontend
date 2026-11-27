import React, { useState } from 'react';
import axios from 'axios';
import {
  Ruler, Weight, Calendar, Percent, Target, Utensils,
  User, Activity, Loader2, CheckCircle2, AlertCircle, Mail, Sparkles,
} from 'lucide-react';
import { useAuthStore, API_URL, getAuthHeaders } from '../store/authStore';

// ── Form Field Components ─────────────────────────────────────────────────
const NumberField = ({ icon: Icon, label, hint, value, onChange, min, max, step = 1, unit }) => (
  <div>
    <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
      />
      {unit && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium pointer-events-none">
          {unit}
        </span>
      )}
    </div>
    {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
  </div>
);

const SelectField = ({ icon: Icon, label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none transition cursor-pointer"
      >
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const ChipGroup = ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-stone-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm'
              : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const DietPlan = () => {
  const [height,        setHeight]        = useState(175);
  const [weight,        setWeight]        = useState(80);
  const [age,           setAge]           = useState(25);
  const [fatPercentage, setFatPercentage] = useState(15);
  const [goal,          setGoal]          = useState('muscle gain');
  const [preferences,   setPreferences]   = useState('high protein');
  const [gender,        setGender]        = useState('male');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [loading,       setLoading]       = useState(false);
  const [status,        setStatus]        = useState(null); // { type: 'success'|'error', msg }
  const { isAuthenticated } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Validation
    if (fatPercentage < 5 || fatPercentage > 50) {
      setStatus({ type: 'error', msg: 'Body fat % must be between 5 and 50.' });
      return;
    }
    if (age < 19 || age > 99) {
      setStatus({ type: 'error', msg: 'Age must be between 19 and 99.' });
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders.accessToken) {
      setStatus({ type: 'error', msg: 'Please log in to generate a personalized diet plan.' });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/ai/diet-plan`,
        { height: +height, age: +age, weight: +weight, fatPercentage: +fatPercentage,
          goal, preferences, gender, activityLevel },
        { headers: authHeaders }
      );
      setStatus({ type: 'success', msg: 'Your diet plan is being generated and will arrive in your email shortly.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || err.message || 'Failed to generate diet plan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" />
            Personalized Nutrition AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight mb-3 drop-shadow">
            Your Diet Plan
          </h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto leading-relaxed">
            Share your stats and goals — we'll craft a tailored meal plan and send it straight to your inbox.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6">

        {/* ── Form Card ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Body stats */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Body Stats</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberField icon={Ruler}   label="Height" value={height} onChange={setHeight} min={120} max={250} unit="cm" />
                  <NumberField icon={Weight}  label="Weight" value={weight} onChange={setWeight} min={30}  max={300} unit="kg" />
                  <NumberField icon={Calendar} label="Age"   value={age}    onChange={setAge}    min={19}  max={99}  unit="yrs" hint="19–99 years" />
                  <NumberField icon={Percent} label="Body Fat %" value={fatPercentage} onChange={setFatPercentage} min={5} max={50} step={0.5} unit="%" hint="5–50%" />
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Gender */}
              <ChipGroup
                label="Gender"
                value={gender}
                onChange={setGender}
                options={[
                  { value: 'male',   label: '♂ Male'   },
                  { value: 'female', label: '♀ Female' },
                ]}
              />

              {/* Goal */}
              <ChipGroup
                label="Your Goal"
                value={goal}
                onChange={setGoal}
                options={[
                  { value: 'muscle gain',  label: '💪 Muscle Gain'  },
                  { value: 'weight loss',  label: '🔥 Weight Loss'  },
                  { value: 'maintenance',  label: '⚖️ Maintenance'   },
                ]}
              />

              <hr className="border-stone-100" />

              {/* Activity level */}
              <SelectField
                icon={Activity}
                label="Activity Level"
                value={activityLevel}
                onChange={setActivityLevel}
                options={[
                  { value: 'Sedentary',          label: 'Sedentary — little or no exercise' },
                  { value: 'Lightly Active',     label: 'Lightly Active — 1–3 days/week'   },
                  { value: 'Moderately Active',  label: 'Moderately Active — 3–5 days/week'},
                  { value: 'Very Active',        label: 'Very Active — 6–7 days/week'       },
                  { value: 'Extremely Active',   label: 'Extremely Active — athlete'        },
                ]}
              />

              {/* Preferences */}
              <SelectField
                icon={Utensils}
                label="Diet Preference"
                value={preferences}
                onChange={setPreferences}
                options={[
                  { value: 'high protein', label: 'High Protein'  },
                  { value: 'low carb',     label: 'Low Carb'      },
                  { value: 'vegetarian',   label: 'Vegetarian'    },
                  { value: 'vegan',        label: 'Vegan'         },
                ]}
              />

              {/* Auth notice */}
              {!isAuthenticated && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  <User className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>You need to be logged in to generate a diet plan.</span>
                </div>
              )}

              {/* Status message */}
              {status && (
                <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm ${
                  status.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  {status.type === 'success'
                    ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    : <AlertCircle  className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{status.msg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Building your plan…
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Generate & Send to Email
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-stone-400 mt-6 leading-relaxed max-w-sm mx-auto">
          Your plan will be generated by AI and emailed to your registered address. Generation usually takes 1–2 minutes.
        </p>
      </div>
    </div>
  );
};

export default DietPlan;
