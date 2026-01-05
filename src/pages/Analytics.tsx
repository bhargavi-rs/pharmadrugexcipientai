import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, FlaskConical } from "lucide-react";

// Mock analytics data - replace with real API calls
const useAnalyticsData = () => {
  const [data, setData] = useState({
    totalPredictions: 0,
    compatibleCount: 0,
    incompatibleCount: 0,
    averageConfidence: 0,
    recentPredictions: [] as any[],
    excipientUsage: [] as any[],
    weeklyTrend: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    const timer = setTimeout(() => {
      setData({
        totalPredictions: 247,
        compatibleCount: 189,
        incompatibleCount: 58,
        averageConfidence: 78.5,
        recentPredictions: [
          { drug: "Aspirin", excipient: "Lactose Monohydrate", result: "Compatible", confidence: 85, date: "2025-01-05" },
          { drug: "Metformin", excipient: "Magnesium Stearate", result: "Compatible", confidence: 92, date: "2025-01-05" },
          { drug: "Ibuprofen", excipient: "PVP K30", result: "Compatible", confidence: 78, date: "2025-01-04" },
          { drug: "Paracetamol", excipient: "Lactose Monohydrate", result: "Incompatible", confidence: 65, date: "2025-01-04" },
          { drug: "Amlodipine", excipient: "MCC", result: "Compatible", confidence: 88, date: "2025-01-03" },
        ],
        excipientUsage: [
          { name: "Lactose", count: 65 },
          { name: "MCC", count: 52 },
          { name: "Mg Stearate", count: 48 },
          { name: "PVP", count: 35 },
          { name: "HPMC", count: 28 },
          { name: "Starch", count: 19 },
        ],
        weeklyTrend: [
          { day: "Mon", predictions: 32, compatible: 26 },
          { day: "Tue", predictions: 41, compatible: 35 },
          { day: "Wed", predictions: 28, compatible: 22 },
          { day: "Thu", predictions: 45, compatible: 38 },
          { day: "Fri", predictions: 52, compatible: 42 },
          { day: "Sat", predictions: 25, compatible: 18 },
          { day: "Sun", predictions: 24, compatible: 20 },
        ],
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
};

const COLORS = ['hsl(152, 69%, 40%)', 'hsl(0, 72%, 51%)'];

const Analytics = () => {
  const { data, loading } = useAnalyticsData();

  const pieData = [
    { name: "Compatible", value: data.compatibleCount },
    { name: "Incompatible", value: data.incompatibleCount },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading analytics...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track prediction metrics and usage patterns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="pharma-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Predictions
              </CardTitle>
              <FlaskConical className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.totalPredictions}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="pharma-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compatible
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{data.compatibleCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((data.compatibleCount / data.totalPredictions) * 100).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="pharma-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Incompatible
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{data.incompatibleCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((data.incompatibleCount / data.totalPredictions) * 100).toFixed(1)}% flagged
              </p>
            </CardContent>
          </Card>

          <Card className="pharma-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Confidence
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.averageConfidence}%</div>
              <p className="text-xs text-muted-foreground mt-1">Model accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Trend */}
          <Card className="pharma-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Weekly Trend</CardTitle>
              <CardDescription>Predictions over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predictions" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Total"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="compatible" 
                      stroke="hsl(152, 69%, 40%)" 
                      strokeWidth={2}
                      name="Compatible"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility Pie Chart */}
          <Card className="pharma-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Compatibility Distribution</CardTitle>
              <CardDescription>Overall prediction outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Excipient Usage Chart */}
        <Card className="pharma-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-display">Excipient Usage</CardTitle>
            <CardDescription>Most frequently tested excipients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.excipientUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Predictions Table */}
        <Card className="pharma-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Predictions
            </CardTitle>
            <CardDescription>Latest drug-excipient compatibility analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Drug</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Excipient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Confidence</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPredictions.map((pred, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm font-medium">{pred.drug}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{pred.excipient}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pred.result === "Compatible" 
                            ? "bg-success/10 text-success" 
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {pred.result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{pred.confidence}%</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{pred.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
