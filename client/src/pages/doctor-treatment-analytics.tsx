import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Calendar, Activity, Pill, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DoctorTreatmentAnalytics() {
  const [, setLocation] = useLocation();
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [selectedSetting, setSelectedSetting] = useState<string>("");

  // Fetch overall treatment analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/treatment", selectedMedication, selectedSetting],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedMedication) params.append("medication", selectedMedication);
      if (selectedSetting) params.append("treatmentSetting", selectedSetting);
      return fetch(`/api/analytics/treatment?${params.toString()}`).then(res => res.json());
    },
  });

  // Fetch dosage statistics
  const { data: dosageStats } = useQuery({
    queryKey: ["/api/analytics/dosage-stats", selectedMedication, selectedSetting],
    enabled: !!(selectedMedication && selectedSetting),
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("medication", selectedMedication);
      params.append("treatmentSetting", selectedSetting);
      return fetch(`/api/analytics/dosage-stats?${params.toString()}`).then(res => res.json());
    },
  });

  const medications = ["abemaciclib", "ribociclib", "palbociclib"];
  const treatmentSettings = ["metastatic", "adjuvant"];

  const medicationNames = {
    abemaciclib: "Abemaciclib",
    ribociclib: "Ribociclib", 
    palbociclib: "Palbociclib"
  };

  const treatmentTypeLabels = {
    metastatic: "Metastatico",
    adjuvant: "Adiuvante"
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!analytics?.medicationBreakdown) return [];
    
    const chartData = [];
    Object.keys(analytics.medicationBreakdown).forEach(medication => {
      Object.keys(analytics.medicationBreakdown[medication]).forEach(setting => {
        const dosages = analytics.medicationBreakdown[medication][setting];
        Object.keys(dosages).forEach(dosage => {
          const data = dosages[dosage];
          chartData.push({
            medication: medicationNames[medication] || medication,
            setting: treatmentTypeLabels[setting] || setting,
            dosage,
            patients: data.patientCount,
            averageWeeks: Math.round(data.averageWeeks || 0),
            label: `${medicationNames[medication]} - ${dosage}`
          });
        });
      });
    });
    
    return chartData;
  };

  const preparePieData = () => {
    if (!analytics?.settingBreakdown) return [];
    
    return Object.keys(analytics.settingBreakdown).map(setting => ({
      name: treatmentTypeLabels[setting] || setting,
      value: analytics.settingBreakdown[setting].patients,
      color: setting === "metastatic" ? "#f97316" : "#059669"
    }));
  };

  const chartData = prepareChartData();
  const pieData = preparePieData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/doctor")}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Trattamento</h1>
              <p className="text-gray-600">Statistiche globali sui trattamenti CDK 4/6</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Farmaco
                </label>
                <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i farmaci" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i farmaci</SelectItem>
                    {medications.map(med => (
                      <SelectItem key={med} value={med}>
                        {medicationNames[med]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Setting Terapeutico
                </label>
                <Select value={selectedSetting} onValueChange={setSelectedSetting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i setting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i setting</SelectItem>
                    {treatmentSettings.map(setting => (
                      <SelectItem key={setting} value={setting}>
                        {treatmentTypeLabels[setting]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Pazienti Totali</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics?.totalPatients || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Setting Metastatico</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics?.settingBreakdown?.metastatic?.patients || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Setting Adiuvante</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics?.settingBreakdown?.adjuvant?.patients || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Media Settimane</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      (analytics?.settingBreakdown?.metastatic?.averageWeeksOnTreatment || 0 + 
                       analytics?.settingBreakdown?.adjuvant?.averageWeeksOnTreatment || 0) / 2
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Treatment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Distribuzione per Setting Terapeutico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => 
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart - Patients per Dosage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Pazienti per Dosaggio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patients" fill="#8884d8" name="Pazienti" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Dosage Statistics */}
        {dosageStats && (
          <Card>
            <CardHeader>
              <CardTitle>
                Statistiche Dettagliate Dosaggi - {medicationNames[selectedMedication]} ({treatmentTypeLabels[selectedSetting]})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(dosageStats).map(dosage => (
                  <Card key={dosage} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-lg font-semibold">
                          {dosage}
                        </Badge>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Pazienti:</span> {dosageStats[dosage].patientCount}
                          </p>
                          <p>
                            <span className="font-medium">Media settimane:</span>{" "}
                            {Math.round(dosageStats[dosage].averageWeeks || 0)}
                          </p>
                          <p>
                            <span className="font-medium">Totale settimane:</span> {dosageStats[dosage].totalWeeks}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {!analytics && (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Caricamento dati analytics...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}