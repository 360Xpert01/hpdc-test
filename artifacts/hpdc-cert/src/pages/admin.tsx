import { Layout } from "@/components/layout";
import { 
  useListCertificates, 
  useGetCertificateStats, 
  useCreateCertificate,
  useUpdateCertificate,
  getListCertificatesQueryKey, 
  getGetCertificateStatsQueryKey,
  useListUsers,
  useUpdateUserRole,
  getListUsersQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { ShieldCheck, XCircle, AlertTriangle, FileText, Plus, Search, Users, Building, Shield } from "lucide-react";
import { format } from "date-fns";

const createSchema = z.object({
  certificateId: z.string().min(1, "Required"),
  status: z.enum(["valid", "expired", "suspended"]),
  companyName: z.string().min(1, "Required"),
  siteName: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  issueDate: z.string().min(1, "Required"),
  expiryDate: z.string().min(1, "Required"),
  certificationBody: z.string().min(1, "Required"),
  schemeOwner: z.string().min(1, "Required"),
  scopeStatement: z.string().min(1, "Required"),
  verificationMessage: z.string().min(1, "Required"),
  companyClerkId: z.string().optional().nullable(),
});

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useGetCertificateStats();
  const { data: certificates, isLoading: certsLoading } = useListCertificates();
  const { data: users, isLoading: usersLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() }});
  
  const createCert = useCreateCertificate();
  const updateCert = useUpdateCertificate();
  const updateRole = useUpdateUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  /* Auto-generate next certificate ID: HPDC-ESG-YYYY-NNN */
  const generateCertId = () => {
    const year = new Date().getFullYear();
    const existing = certificates ?? [];
    // find the highest sequential number used in any HPDC-ESG-YYYY-NNN cert this year
    const prefix = `HPDC-ESG-${year}-`;
    let maxNum = 0;
    for (const c of existing) {
      if (c.certificateId.startsWith(prefix)) {
        const num = parseInt(c.certificateId.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    const next = String(maxNum + 1).padStart(3, "0");
    return `${prefix}${next}`;
  };

  const handleStatusChange = (certificateId: string, newStatus: "valid" | "expired" | "suspended") => {
    setChangingStatus(certificateId);
    updateCert.mutate({ certificateId, data: { status: newStatus } as any }, {
      onSuccess: () => {
        toast({ title: `Status updated to "${newStatus}"`, description: `Certificate ${certificateId} has been updated.` });
        queryClient.invalidateQueries({ queryKey: getListCertificatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCertificateStatsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Error updating status", description: err.message, variant: "destructive" });
      },
      onSettled: () => setChangingStatus(null),
    });
  };

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      certificateId: "",
      status: "valid",
      companyName: "",
      siteName: "",
      location: "",
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      certificationBody: "شركة تطوير منتجات الحلال (HPDC)",
      schemeOwner: "HPDC",
      scopeStatement: "Environmental, Social, and Governance compliance according to HPDC framework.",
      verificationMessage: "This certificate is officially verified by HPDC.",
      companyClerkId: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createSchema>) => {
    // Clean up empty string to undefined
    const submitData = { ...values };
    if (!submitData.companyClerkId) submitData.companyClerkId = null;

    createCert.mutate({ data: submitData as any }, {
      onSuccess: () => {
        toast({ title: "Certificate created successfully" });
        queryClient.invalidateQueries({ queryKey: getListCertificatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCertificateStatsQueryKey() });
        setOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ 
          title: "Error creating certificate", 
          description: err.message || "An unexpected error occurred", 
          variant: "destructive" 
        });
      }
    });
  };

  const handleToggleRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "company" : "admin";
    updateRole.mutate({ userId, data: { role: newRole as any } }, {
      onSuccess: () => {
        toast({ title: `Role updated to ${newRole}` });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Error updating role", description: err.message, variant: "destructive" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-primary hover:bg-primary">Valid</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "suspended":
        return <Badge className="bg-secondary hover:bg-secondary text-white">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCerts = certificates?.filter(c => 
    c.certificateId.toLowerCase().includes(search.toLowerCase()) || 
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users?.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.companyName && u.companyName.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage HPDC ESG Certificates & Users</p>
          </div>
        </div>

        <Tabs defaultValue="certificates" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="certificates" className="data-[state=active]:bg-white">
              <FileText className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4"/> Total Certificates</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{statsLoading ? "-" : stats?.total}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Valid</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-primary">{statsLoading ? "-" : stats?.valid}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-destructive flex items-center gap-2"><XCircle className="w-4 h-4"/> Expired</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-destructive">{statsLoading ? "-" : stats?.expired}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-secondary flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Suspended</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-secondary">{statsLoading ? "-" : stats?.suspended}</div></CardContent>
              </Card>
            </div>

            {/* Certificates Table */}
            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Certificate Registry</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative w-64">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        placeholder="Search by ID or Company..." 
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Dialog open={open} onOpenChange={(val) => {
                      setOpen(val);
                      if (val) form.setValue("certificateId", generateCertId());
                    }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          New Certificate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Certificate</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={form.control} name="certificateId" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Certificate ID (Auto-Generated)</FormLabel>
                                  <div className="flex gap-2">
                                    <FormControl>
                                      <Input {...field} readOnly className="font-mono bg-muted/50 cursor-default" />
                                    </FormControl>
                                    <Button type="button" variant="outline" size="icon" title="Regenerate ID"
                                      onClick={() => field.onChange(generateCertId())}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.93 14.93A10 10 0 1 0 6.34 6.34" />
                                      </svg>
                                    </Button>
                                  </div>
                                  <FormMessage/>
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="valid">Valid</SelectItem>
                                      <SelectItem value="expired">Expired</SelectItem>
                                      <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage/>
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="companyName" render={({ field }) => (
                                <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                              )} />
                              <FormField control={form.control} name="siteName" render={({ field }) => (
                                <FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                              )} />
                              <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                              )} />
                              <FormField control={form.control} name="certificationBody" render={({ field }) => (
                                <FormItem><FormLabel>Certification Body</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                              )} />
                              <FormField control={form.control} name="issueDate" render={({ field }) => (
                                <FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                              )} />
                              <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                              )} />
                              <FormField control={form.control} name="companyClerkId" render={({ field }) => (
                                <FormItem className="col-span-2"><FormLabel>Company Clerk ID (Optional - For Dashboard Access)</FormLabel><FormControl><Input placeholder="user_2X..." {...field} value={field.value || ''} /></FormControl><FormMessage/></FormItem>
                              )} />
                            </div>
                            <FormField control={form.control} name="schemeOwner" render={({ field }) => (
                              <FormItem><FormLabel>Scheme Owner</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                            )} />
                            <FormField control={form.control} name="verificationMessage" render={({ field }) => (
                              <FormItem><FormLabel>Verification Message</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                            )} />
                            <FormField control={form.control} name="scopeStatement" render={({ field }) => (
                              <FormItem><FormLabel>Scope Statement</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={createCert.isPending}>
                              {createCert.isPending ? "Creating..." : "Create Certificate"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {certsLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading certificates...</div>
                ) : filteredCerts && filteredCerts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Linked User</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCerts.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono font-medium">{cert.certificateId}</TableCell>
                          <TableCell>{cert.companyName}</TableCell>
                          <TableCell>{getStatusBadge(cert.status)}</TableCell>
                          <TableCell>{format(new Date(cert.issueDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{format(new Date(cert.expiryDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {cert.companyClerkId ? (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground font-mono text-xs" title={cert.companyClerkId}>Linked</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={cert.status}
                                onValueChange={(val) => handleStatusChange(cert.certificateId, val as "valid" | "expired" | "suspended")}
                                disabled={changingStatus === cert.certificateId}
                              >
                                <SelectTrigger className="h-8 w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="valid">✅ Valid</SelectItem>
                                  <SelectItem value="expired">❌ Expired</SelectItem>
                                  <SelectItem value="suspended">⚠️ Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                              <Link href={`/certificate?id=${cert.certificateId}`} className="text-primary hover:underline text-xs whitespace-nowrap">
                                View
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No certificates found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      className="pl-9"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User / Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Clerk ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>
                            {u.companyName ? (
                              <span className="flex items-center gap-1 text-muted-foreground"><Building className="w-3 h-3"/> {u.companyName}</span>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{u.clerkId}</TableCell>
                          <TableCell>
                            {u.role === "admin" ? (
                              <Badge className="bg-primary/20 text-primary border-primary/30 flex w-fit items-center gap-1">
                                <Shield className="w-3 h-3" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="capitalize">{u.role}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleRole(u.clerkId, u.role)}
                              disabled={updateRole.isPending}
                            >
                              Toggle Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No users found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
