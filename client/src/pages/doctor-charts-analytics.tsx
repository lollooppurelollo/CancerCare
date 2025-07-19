import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, PieChart, TrendingDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';

interface DosageWeeksData {
  dosage: string;
  averageWeeks: number;
  patientCount: number;
  medication: string;
  treatmentSetting: string;
}

interface ToxicityData {
  symptom: string;
  count: number;
  severity: number;
  medication: string;
  treatmentSetting: string;
}

interface ComparisonData {
  medication: string;
  totalToxicities: number;
  averageSeverity: number;
  dosageReductions: number;
  averageWeeksBeforeReduction: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

export default function DoctorChartsAnalytics() {
  const [, setLocation] = useLocation();
  const [selectedMedication, setSelectedMedication] = useState<string>("all");
  const [selectedSetting, setSelectedSetting] = useState<string>("all");

  const { data: dosageData } = useQuery<DosageWeeksData[]>({
    queryKey: ["/api/analytics/dosage-weeks-data", selectedMedication, selectedSetting],
  });

  const { data: toxicityData } = useQuery<ToxicityData[]>({
    queryKey: ["/api/analytics/toxicity-data", selectedMedication, selectedSetting],
  });

  const { data: comparisonData } = useQuery<ComparisonData[]>({
    queryKey: ["/api/analytics/medication-comparison"],
  });

  const filteredDosageData = dosageData?.filter(item => {
    const medicationMatch = selectedMedication === "all" || item.medication === selectedMedication;
    const settingMatch = selectedSetting === "all" || item.treatmentSetting === selectedSetting;
    return medicationMatch && settingMatch;
  }) || [];

  const filteredToxicityData = toxicityData?.filter(item => {
    const medicationMatch = selectedMedication === "all" || item.medication === selectedMedication;
    const settingMatch = selectedSetting === "all" || item.treatmentSetting === selectedSetting;
    return medicationMatch && settingMatch;
  }) || [];

  // Prepare data for charts
  const dosageChartData = filteredDosageData.map((item, index) => ({
    name: `${item.medication} ${item.dosage}`,
    settimane: item.averageWeeks,
    pazienti: item.patientCount,
    medication: item.medication,
    fill: COLORS[index % COLORS.length]
  }));

  const toxicityPieData = filteredToxicityData.map((item, index) => ({
    name: item.symptom,
    value: item.count,
    severity: item.severity,
    fill: COLORS[index % COLORS.length]
  }));

  const medicationComparisonToxicity = comparisonData?.map(item => ({
    medication: item.medication,
    tossicita: item.totalToxicities,
    gravita: item.averageSeverity
  })) || [];

  const medicationComparisonDosage = comparisonData?.map(item => ({
    medication: item.medication,
    riduzioni: item.dosageReductions,
    settimane: item.averageWeeksBeforeReduction
  })) || [];

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-sage-50 border-b border-sage-200 p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/doctor")}
            className="text-sage-600 hover:bg-sage-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold text-sage-800">Analisi Grafiche Avanzate</h1>
            <p className="text-sm text-sage-600">Grafici interattivi per analisi approfondita</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sage-800">Controlli Analisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-sage-700 mb-2 block">Farmaco</label>
                <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                  <SelectTrigger className="border-sage-200 focus:ring-sage-500">
                    <SelectValue placeholder="Seleziona farmaco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i farmaci</SelectItem>
                    <SelectItem value="abemaciclib">Abemaciclib</SelectItem>
                    <SelectItem value="ribociclib">Ribociclib</SelectItem>
                    <SelectItem value="palbociclib">Palbociclib</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-sage-700 mb-2 block">Setting Terapeutico</label>
                <Select value={selectedSetting} onValueChange={setSelectedSetting}>
                  <SelectTrigger className="border-sage-200 focus:ring-sage-500">
                    <SelectValue placeholder="Seleziona setting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i setting</SelectItem>
                    <SelectItem value="metastatic">Metastatico</SelectItem>
                    <SelectItem value="adjuvant">Adiuvante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dosage Duration Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-sage-600" />
              <CardTitle className="text-sage-800">Settimane per Dosaggio Prima della Riduzione</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dosageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'settimane' ? `${value} settimane` : `${value} pazienti`,
                      name === 'settimane' ? 'Settimane Medie' : 'Numero Pazienti'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="settimane" fill="#10b981" name="settimane" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Toxicity Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-sage-600" />
              <CardTitle className="text-sage-800">Distribuzione Tossicità Riportate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart data={toxicityPieData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Tooltip 
                    formatter={(value, name) => [`${value} casi`, name]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <RechartsPieChart 
                    data={toxicityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {toxicityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Medication Comparison - Toxicities */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-sage-600" />
              <CardTitle className="text-sage-800">Confronto Tossicità tra Farmaci</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={medicationComparisonToxicity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="medication" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'tossicita' ? `${value} casi` : `${value} gravità media`,
                      name === 'tossicita' ? 'Tossicità Totali' : 'Gravità Media'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar yAxisId="left" dataKey="tossicita" fill="#ef4444" name="tossicita" />
                  <Line yAxisId="right" type="monotone" dataKey="gravita" stroke="#f59e0b" strokeWidth={3} name="gravita" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Medication Comparison - Dosage Reductions */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-sage-600" />
              <CardTitle className="text-sage-800">Confronto Riduzioni Dosaggio tra Farmaci</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={medicationComparisonDosage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="medication" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'riduzioni' ? `${value} riduzioni` : `${value} settimane`,
                      name === 'riduzioni' ? 'Riduzioni Totali' : 'Settimane Medie'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar yAxisId="left" dataKey="riduzioni" fill="#3b82f6" name="riduzioni" />
                  <Line yAxisId="right" type="monotone" dataKey="settimane" stroke="#10b981" strokeWidth={3} name="settimane" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}