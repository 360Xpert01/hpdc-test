import { useSearch, useLocation } from "wouter";
import { useGetCertificate } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, XCircle, AlertTriangle, Building2, MapPin, CalendarDays, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { findSeedCert, type SeedCert } from "@/lib/cert-seed-data";
import { useLanguage } from "@/contexts/language-context";

export default function VerifyPage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const idParam = searchParams.get("id");
  const [, setLocation] = useLocation();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [searchInput, setSearchInput] = useState(idParam || "");

  const { data: certificate, isLoading, isError } = useGetCertificate(idParam || "", {
    query: {
      enabled: !!idParam,
      queryKey: ["/api/certificates", idParam]
    }
  });

  // Fallback: check seed data when API returns 404
  const seedCert: SeedCert | undefined = (isError && idParam) ? findSeedCert(idParam) : undefined;

  // Keep input in sync with URL
  useEffect(() => {
    if (idParam) setSearchInput(idParam);
  }, [idParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(`/verify?id=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "valid":
        return {
          icon: <ShieldCheck className="w-12 h-12 text-primary" />,
          badge: <Badge className="bg-primary hover:bg-primary/90 text-white text-lg px-4 py-1">Valid / صالح</Badge>,
          bg: "bg-primary/5",
          border: "border-primary/20"
        };
      case "expired":
        return {
          icon: <XCircle className="w-12 h-12 text-destructive" />,
          badge: <Badge variant="destructive" className="text-lg px-4 py-1">Expired / منتهي</Badge>,
          bg: "bg-destructive/5",
          border: "border-destructive/20"
        };
      case "suspended":
        return {
          icon: <AlertTriangle className="w-12 h-12 text-secondary" />,
          badge: <Badge className="bg-secondary hover:bg-secondary/90 text-white text-lg px-4 py-1">Suspended / معلق</Badge>,
          bg: "bg-secondary/5",
          border: "border-secondary/20"
        };
      default:
        return {
          icon: <ShieldCheck className="w-12 h-12 text-muted-foreground" />,
          badge: <Badge variant="outline" className="text-lg px-4 py-1">Unknown / غير معروف</Badge>,
          bg: "bg-muted",
          border: "border-border"
        };
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {!idParam && (
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-6">
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              Certificate Verification
            </h1>
            <p className="text-lg text-muted-foreground">
              التحقق من الشهادة
            </p>
            <p className="text-muted-foreground">
              Enter a certificate ID to verify its authenticity and current status.
            </p>
            
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-8">
              <Input
                placeholder="e.g. CERT-12345"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-12 text-lg text-center"
              />
              <Button type="submit" className="h-12 px-8">
                <Search className="w-5 h-5 mr-2" />
                Verify
              </Button>
            </form>
          </div>
        )}

        {isLoading && idParam && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary font-medium">Verifying certificate...</p>
          </div>
        )}

        {isError && idParam && !seedCert && (
          <Card className="border-destructive/20 bg-destructive/5 text-center py-16">
            <CardContent className="space-y-4">
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold text-destructive">
                {isAr ? "لم يتم العثور على الشهادة" : "Certificate Not Found"}
              </h2>
              <p className="text-muted-foreground">{isAr ? "شهادة غير موجودة" : "Certificate not found"}</p>
              <p className="max-w-md mx-auto text-sm">
                {isAr
                  ? <>رقم الشهادة <strong>{idParam}</strong> غير موجود في سجلاتنا. تحقق من الرقم وأعد المحاولة.</>
                  : <>The certificate ID <strong>{idParam}</strong> could not be verified. It may be invalid or not exist in our registry.</>}
              </p>
              <Button variant="outline" onClick={() => setLocation("/verify")} className="mt-4">
                {isAr ? "بحث مرة أخرى" : "Search Again"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Seed data fallback — registry certificates */}
        {seedCert && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className={`border-2 overflow-hidden ${
              seedCert.status === "valid" ? "border-green-200 bg-green-50" :
              seedCert.status === "expired" ? "border-red-200 bg-red-50" :
              "border-yellow-200 bg-yellow-50"
            }`}>
              <CardContent className="p-8 sm:p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-full shadow-sm">
                    {getStatusConfig(seedCert.status).icon}
                  </div>
                </div>
                <div className="space-y-2">
                  {getStatusConfig(seedCert.status).badge}
                  <h2 className="text-3xl font-bold font-mono mt-4 text-foreground">{seedCert.certificateId}</h2>
                </div>
                <p className="text-lg font-medium text-foreground max-w-lg mx-auto">
                  {isAr ? "هذه الشهادة صادرة رسمياً من شركة تطوير منتجات الحلال (HPDC)" : "This certificate is officially issued by Halal Products Development Company (HPDC)."}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">
                      {isAr ? "تفاصيل المنشأة" : "Organization Details"}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{isAr ? "اسم المنشأة" : "Organization"}</p>
                          <p className="font-semibold">{seedCert.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{isAr ? "الموقع" : "Location"}</p>
                          <p className="font-medium text-sm">{seedCert.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Award className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{isAr ? "الموقع / المصنع" : "Site"}</p>
                          <p className="font-medium text-sm">{seedCert.siteName}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 flex justify-between">
                      <span>{isAr ? "مدة الصلاحية" : "Certificate Validity"}</span>
                    </h3>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{isAr ? "تاريخ الإصدار" : "Issue Date"}</p>
                        <p className="font-semibold">{seedCert.issueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</p>
                        <p className={`font-semibold ${seedCert.status === "expired" ? "text-destructive" : ""}`}>{seedCert.expiryDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">
                    {isAr ? "نطاق الاعتماد" : "Certification Scope"}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">{seedCert.scopeStatement}</p>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">{isAr ? "الجهة المانحة" : "Issuing Body"}</p>
                    <p className="font-semibold text-sm">
                      {isAr ? "شركة تطوير منتجات الحلال (HPDC)" : "Halal Products Development Company (HPDC)"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {certificate && !isLoading && !isError && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top Verification Status */}
            <Card className={`border-2 ${getStatusConfig(certificate.status).border} ${getStatusConfig(certificate.status).bg} overflow-hidden`}>
              <CardContent className="p-8 sm:p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-full shadow-sm">
                    {getStatusConfig(certificate.status).icon}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {getStatusConfig(certificate.status).badge}
                  <h2 className="text-3xl font-bold font-mono mt-4 text-foreground">
                    {certificate.certificateId}
                  </h2>
                </div>
                
                <p className="text-lg font-medium text-foreground max-w-lg mx-auto">
                  {certificate.verificationMessage || "This certificate is officially verified by HPDC."}
                </p>
              </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Left Column: Details & Validity */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2 flex justify-between">
                    <span>Certificate Details</span>
                    <span dir="rtl">تفاصيل الشهادة</span>
                  </h3>
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <Building2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div className="w-full flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Company Name</p>
                            <p className="font-semibold text-lg">{certificate.companyName}</p>
                          </div>
                          <div className="text-right" dir="rtl">
                            <p className="text-sm text-muted-foreground">اسم الشركة</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <Building2 className="w-5 h-5 text-primary mt-1 shrink-0 opacity-70" />
                        <div className="w-full flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Site / Facility Name</p>
                            <p className="font-medium">{certificate.siteName}</p>
                          </div>
                          <div className="text-right" dir="rtl">
                            <p className="text-sm text-muted-foreground">اسم الموقع</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div className="w-full flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{certificate.location}</p>
                          </div>
                          <div className="text-right" dir="rtl">
                            <p className="text-sm text-muted-foreground">الموقع</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2 flex justify-between">
                    <span>Validity</span>
                    <span dir="rtl">صلاحية</span>
                  </h3>
                  <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <CalendarDays className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div className="w-full flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Issue Date</p>
                            <p className="font-medium">{format(new Date(certificate.issueDate), 'MMMM d, yyyy')}</p>
                          </div>
                          <div className="text-right" dir="rtl">
                            <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <CalendarDays className="w-5 h-5 text-primary mt-1 shrink-0 opacity-70" />
                        <div className="w-full flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Expiry Date</p>
                            <p className="font-medium">{format(new Date(certificate.expiryDate), 'MMMM d, yyyy')}</p>
                          </div>
                          <div className="text-right" dir="rtl">
                            <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>

              {/* Right Column: Source & Scope */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2 flex justify-between">
                    <span>Certification Source</span>
                    <span dir="rtl">مصدر الشهادة</span>
                  </h3>
                  <Card className="shadow-sm bg-primary/5 border-primary/10">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <Award className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div className="w-full flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">Issuing Body / جهة الإصدار</p>
                            <p className="font-bold text-primary">شركة تطوير منتجات الحلال</p>
                            <p className="text-sm text-muted-foreground">HALAL PRODUCTS DEVELOPMENT COMPANY (HPDC)</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2 flex justify-between">
                    <span>Scope</span>
                    <span dir="rtl">نطاق الشهادة</span>
                  </h3>
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {certificate.scopeStatement}
                      </p>
                    </CardContent>
                  </Card>
                </section>
              </div>

            </div>

            <div className="text-center pt-8">
              <Button variant="outline" onClick={() => setLocation("/")} className="px-8">
                Verify Another Certificate
              </Button>
            </div>
            
          </div>
        )}
      </div>
    </Layout>
  );
}
