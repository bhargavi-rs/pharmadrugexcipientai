import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Loader2, Send, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "If an account exists, a reset link has been sent.",
      });
    } catch (error: any) {
      // Always show the same message for security
      setIsEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "If an account exists, a reset link has been sent.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Reset password</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        {isEmailSent ? (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Check your email</h3>
              <p className="text-muted-foreground text-sm mt-1">
                If an account exists for {email}, a password reset link has been sent.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsEmailSent(false)}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-muted/30 border-border/50 focus:border-primary"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Reset Email
                  <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
