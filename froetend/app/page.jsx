import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, CheckCircle, Clock, Shield, TrendingUp, ChevronRight } from "lucide-react"



export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
     
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find the perfect freelance services for your business
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect with talented freelancers and get high-quality work done quickly and efficiently.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search for any service..." className="w-full pl-8" />
                  </div>
                  <Button size="lg" className="sm:w-auto">
                    Search
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>Popular:</span>
                  <a href="#" className="hover:underline">
                    Web Design
                  </a>
                  <a href="#" className="hover:underline">
                    Logo Design
                  </a>
                  <a href="#" className="hover:underline">
                    Content Writing
                  </a>
                  <a href="#" className="hover:underline">
                    Digital Marketing
                  </a>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                <img
                  src="/placeholder.svg?height=550&width=550"
                  alt="Hero Image"
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Services</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Browse through our most popular and highly-rated services
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {[1, 2, 3, 4].map((item) => (
                <a
                  href="#"
                  key={item}
                  className="group relative overflow-hidden rounded-lg border bg-background hover:shadow-md transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={`/placeholder.svg?height=200&width=300&text=Service ${item}`}
                      alt={`Service ${item}`}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img
                          src="/placeholder.svg?height=32&width=32"
                          alt="Seller"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">Seller Name</span>
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      I will create a professional website design for your business
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                      <span className="text-xs text-muted-foreground">(120)</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Starting at</span>
                      <span className="font-bold">£99</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-1">
                View All Services
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Clients Say</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Hear from our satisfied clients about their experience with Riveff
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg border bg-background p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Client"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">Client Name</h4>
                      <p className="text-sm text-muted-foreground">Company Name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Working with Riveff was an amazing experience. The freelancer delivered high-quality work on time
                    and was very professional throughout the project."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose Riveff</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Discover the benefits of using our platform for your freelance needs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Quality Work</h3>
                <p className="text-muted-foreground">
                  Access a global network of skilled professionals who deliver high-quality work.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Get your projects completed quickly with our efficient freelancers.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Our secure payment system ensures your transactions are safe and protected.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Growth Opportunities</h3>
                <p className="text-muted-foreground">
                  Expand your business with access to a wide range of skills and services.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Top Talent</h3>
                <p className="text-muted-foreground">Work with the best freelancers who are vetted and highly rated.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Satisfaction Guaranteed</h3>
                <p className="text-muted-foreground">We ensure you're satisfied with the work or your money back.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Started?</h2>
                <p className="max-w-[700px] md:text-xl">Join thousands of clients and freelancers on Riveff today</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button size="lg" variant="secondary">
                  <a href="#">Find Talent</a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent">
                  <a href="#">Become a Seller</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Graphics & Design
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Digital Marketing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Writing & Translation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Video & Animation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Programming & Tech
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">About</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Partnerships
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Help & Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Trust & Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Selling on Riveff
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Buying on Riveff
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Forum
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Podcast
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Affiliates
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center border-t py-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="font-bold">Riveff</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 md:mt-0">
              © {new Date().getFullYear()} Riveff. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}