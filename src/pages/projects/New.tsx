import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Calculator, Building2, FileText } from "lucide-react";
import PageSection from "@/components/layout/PageSection";

export default function New() {
  return (
    <PageSection 
      title="Create New Project" 
      subtitle="Choose how you'd like to create your project"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Regular Project */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/projects/new-project">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Project</CardTitle>
                  <CardDescription>Create a standard project</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Set up a new project with timeline, resources, and deliverables. 
                Perfect for client work and internal initiatives.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Plus className="h-4 w-4" />
                Start New Project
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Internal Quote Calculator */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/projects/new-internal">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Internal Quote Calculator</CardTitle>
                  <CardDescription>Calculate project costs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use Team1's internal calculator to estimate project costs, 
                materials, and labor before submitting to the team.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Calculator className="h-4 w-4" />
                Open Calculator
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects/templates">
              <FileText className="h-4 w-4 mr-2" />
              Browse Templates
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              <Building2 className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </PageSection>
  );
}