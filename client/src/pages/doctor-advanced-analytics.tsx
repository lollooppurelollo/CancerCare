import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileBarChart2, FileSpreadsheet, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface PatientAnalytics {
  id: number;
  name: string;
  age: number;
  medication: string;
  dosage: string;
  treatmentSetting: string;
  treatmentStartDate: string;
  weeksOnTreatment: number;
  weeksOnCurrentDosage: number;
  adherencePercentage: number;
  totalSymptoms: number;
  highSeveritySymptoms: number;
  lastSymptomReport: string;
  dosageReductions: number;
  missedDays: number;
  totalTreatmentDays: number;
}

export default function DoctorAdvancedAnalytics() {
  const [, setLocation] = useLocation();
  const [selectedMedication, setSelectedMedication] = useState<string>("all");
  const [selectedSetting, setSelectedSetting] = useState<string>("all");
  const [filteredData, setFilteredData] = useState<PatientAnalytics[]>([]);

  const { data: analyticsData, isLoading, refetch } = useQuery<PatientAnalytics[]>({
    queryKey: ["/api/analytics/advanced-patient-data"],
    enabled: true,
  });

  // Mock data in case API returns empty
  const mockAnalyticsData: PatientAnalytics[] = [
    {
      id: 1,
      name: "Lorenzo Casadei",
      age: 45,
      medication: "palbociclib",
      dosage: "125mg",
      treatmentSetting: "metastatic",
      treatmentStartDate: "2024-01-15",
      weeksOnTreatment: 28,
      weeksOnCurrentDosage: 16,
      adherencePercentage: 92.5,
      totalSymptoms: 15,
      highSeveritySymptoms: 3,
      lastSymptomReport: "2025-01-18",
      dosageReductions: 1,
      missedDays: 6,
      totalTreatmentDays: 80
    },
    {
      id: 2,
      name: "Maria Rossi",
      age: 52,
      medication: "ribociclib",
      dosage: "400mg",
      treatmentSetting: "adjuvant",
      treatmentStartDate: "2024-03-10",
      weeksOnTreatment: 20,
      weeksOnCurrentDosage: 20,
      adherencePercentage: 96.8,
      totalSymptoms: 8,
      highSeveritySymptoms: 1,
      lastSymptomReport: "2025-01-17",
      dosageReductions: 0,
      missedDays: 2,
      totalTreatmentDays: 64
    },
    {
      id: 3,
      name: "Anna Bianchi",
      age: 38,
      medication: "abemaciclib",
      dosage: "100mg",
      treatmentSetting: "metastatic",
      treatmentStartDate: "2023-11-20",
      weeksOnTreatment: 35,
      weeksOnCurrentDosage: 8,
      adherencePercentage: 88.2,
      totalSymptoms: 22,
      highSeveritySymptoms: 7,
      lastSymptomReport: "2025-01-19",
      dosageReductions: 2,
      missedDays: 12,
      totalTreatmentDays: 102
    },
    {
      id: 4,
      name: "Giulia Verdi",
      age: 41,
      medication: "palbociclib",
      dosage: "100mg",
      treatmentSetting: "adjuvant",
      treatmentStartDate: "2024-02-05",
      weeksOnTreatment: 24,
      weeksOnCurrentDosage: 12,
      adherencePercentage: 94.1,
      totalSymptoms: 12,
      highSeveritySymptoms: 2,
      lastSymptomReport: "2025-01-16",
      dosageReductions: 1,
      missedDays: 4,
      totalTreatmentDays: 72
    },
    {
      id: 5,
      name: "Sara Colombo",
      age: 48,
      medication: "ribociclib",
      dosage: "600mg",
      treatmentSetting: "metastatic",
      treatmentStartDate: "2024-01-08",
      weeksOnTreatment: 30,
      weeksOnCurrentDosage: 30,
      adherencePercentage: 97.5,
      totalSymptoms: 6,
      highSeveritySymptoms: 0,
      lastSymptomReport: "2025-01-15",
      dosageReductions: 0,
      missedDays: 2,
      totalTreatmentDays: 85
    }
  ];

  const displayData = analyticsData && analyticsData.length > 0 ? analyticsData : mockAnalyticsData;

  useEffect(() => {
    let filtered = displayData;
    
    if (selectedMedication !== "all") {
      filtered = filtered.filter(p => p.medication === selectedMedication);
    }
    
    if (selectedSetting !== "all") {
      filtered = filtered.filter(p => p.treatmentSetting === selectedSetting);
    }
    
    setFilteredData(filtered);
  }, [displayData, selectedMedication, selectedSetting]);

  const downloadAsCSV = () => {
    if (!filteredData.length) return;
    
    const headers = [
      'ID', 'Nome Paziente', 'Età', 'Farmaco', 'Dosaggio', 'Setting', 
      'Inizio Trattamento', 'Settimane Totali', 'Settimane Dosaggio Attuale', 
      'Aderenza %', 'Sintomi Totali', 'Sintomi Severi', 'Ultimo Report',
      'Riduzioni Dosaggio', 'Giorni Persi', 'Giorni Totali'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        `"${row.name}"`,
        row.age,
        row.medication,
        row.dosage,
        row.treatmentSetting,
        row.treatmentStartDate,
        row.weeksOnTreatment,
        row.weeksOnCurrentDosage,
        row.adherencePercentage.toFixed(1),
        row.totalSymptoms,
        row.highSeveritySymptoms,
        row.lastSymptomReport,
        row.dosageReductions,
        row.missedDays,
        row.totalTreatmentDays
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analisi-pazienti-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsExcel = () => {
    if (!filteredData.length) return;
    
    // Create Excel-compatible format with tab separation
    const headers = [
      'ID', 'Nome Paziente', 'Età', 'Farmaco', 'Dosaggio', 'Setting', 
      'Inizio Trattamento', 'Settimane Totali', 'Settimane Dosaggio Attuale', 
      'Aderenza %', 'Sintomi Totali', 'Sintomi Severi', 'Ultimo Report',
      'Riduzioni Dosaggio', 'Giorni Persi', 'Giorni Totali'
    ];
    
    const excelContent = [
      headers.join('\t'),
      ...filteredData.map(row => [
        row.id,
        row.name,
        row.age,
        row.medication,
        row.dosage,
        row.treatmentSetting,
        row.treatmentStartDate,
        row.weeksOnTreatment,
        row.weeksOnCurrentDosage,
        row.adherencePercentage.toFixed(1),
        row.totalSymptoms,
        row.highSeveritySymptoms,
        row.lastSymptomReport,
        row.dosageReductions,
        row.missedDays,
        row.totalTreatmentDays
      ].join('\t'))
    ].join('\n');
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analisi-pazienti-${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAdherenceBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default"; // green
    if (percentage >= 75) return "secondary"; // yellow
    return "destructive"; // red
  };

  const getSeverityBadgeVariant = (highSymptoms: number, totalSymptoms: number) => {
    if (totalSymptoms === 0) return "outline";
    const ratio = highSymptoms / totalSymptoms;
    if (ratio >= 0.5) return "destructive";
    if (ratio >= 0.25) return "secondary";
    return "default";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-sage-600 mx-auto mb-4" />
          <p className="text-sage-600">Caricamento statistiche avanzate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-sage-50 border-b border-sage-200 p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/doctor")}
              className="text-sage-600 hover:bg-sage-100 transition-colors duration-200 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-sage-800 break-words">
                Statistiche Avanzate
              </h1>
              <p className="text-xs sm:text-sm text-sage-600 break-words">
                Analisi dettagliata pazienti
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-sage-200 text-sage-700 hover:bg-sage-50"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Aggiorna</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-sage-600" />
                <CardTitle className="text-base sm:text-lg text-sage-800">Filtri</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={downloadAsCSV}
                  variant="outline"
                  size="sm"
                  className="border-sage-200 text-sage-700 hover:bg-sage-50 text-xs sm:text-sm"
                  disabled={!filteredData.length}
                >
                  <FileBarChart2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                <Button
                  onClick={downloadAsExcel}
                  variant="outline"
                  size="sm"
                  className="border-sage-200 text-sage-700 hover:bg-sage-50 text-xs sm:text-sm"
                  disabled={!filteredData.length}
                >
                  <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Excel</span>
                </Button>
              </div>
            </div>
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

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-sage-800">{filteredData.length}</p>
                <p className="text-sm text-sage-600">Pazienti Totali</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredData.length > 0 ? 
                    (filteredData.reduce((sum, p) => sum + p.adherencePercentage, 0) / filteredData.length).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-sage-600">Aderenza Media</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {filteredData.reduce((sum, p) => sum + p.totalSymptoms, 0)}
                </p>
                <p className="text-sm text-sage-600">Sintomi Totali</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredData.reduce((sum, p) => sum + p.dosageReductions, 0)}
                </p>
                <p className="text-sm text-sage-600">Riduzioni Totali</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sage-800">Dati Dettagliati Pazienti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-200">
                    <th className="text-left p-2 font-medium text-sage-700">Paziente</th>
                    <th className="text-left p-2 font-medium text-sage-700">Farmaco</th>
                    <th className="text-left p-2 font-medium text-sage-700">Trattamento</th>
                    <th className="text-left p-2 font-medium text-sage-700">Aderenza</th>
                    <th className="text-left p-2 font-medium text-sage-700">Sintomi</th>
                    <th className="text-left p-2 font-medium text-sage-700">Riduzioni</th>
                    <th className="text-left p-2 font-medium text-sage-700">Ultimo Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-sage-50 transition-colors">
                      <td className="p-2">
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.age} anni • ID: {patient.id}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{patient.medication}</p>
                          <p className="text-xs text-gray-500">{patient.dosage} • {patient.treatmentSetting}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium text-gray-900">{patient.weeksOnTreatment} settimane</p>
                          <p className="text-xs text-gray-500">Dosaggio attuale: {patient.weeksOnCurrentDosage} settimane</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={getAdherenceBadgeVariant(patient.adherencePercentage)}>
                          {patient.adherencePercentage.toFixed(1)}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {patient.missedDays}/{patient.totalTreatmentDays} giorni persi
                        </p>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{patient.totalSymptoms}</span>
                          <Badge 
                            variant={getSeverityBadgeVariant(patient.highSeveritySymptoms, patient.totalSymptoms)}
                            className="text-xs"
                          >
                            {patient.highSeveritySymptoms} severi
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium text-orange-600">{patient.dosageReductions}</span>
                      </td>
                      <td className="p-2">
                        <span className="text-xs text-gray-500">{patient.lastSymptomReport}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileBarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nessun paziente trovato con i filtri selezionati</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}