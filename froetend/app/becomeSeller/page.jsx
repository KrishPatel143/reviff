import BecomeSellerForm from "../../components/become-seller-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BecomeSeller() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <Link 
          href="/" 
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Become a Seller</h1>
          <p className="text-muted-foreground mt-2">
            Complete your seller profile to start offering your services on our platform.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <BecomeSellerForm />
          </div>
    
        </div>
      </div>
    </div>
  )
}