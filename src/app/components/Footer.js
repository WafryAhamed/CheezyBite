import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary bg-pattern py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/">
              <Image src="/logo.svg" width={160} height={160} alt="CheezyBite" />
            </Link>
            <p className="text-white/80 text-sm text-center md:text-left max-w-xs">
              Sri Lanka's favorite pizza destination. Fresh ingredients, authentic flavors, delivered hot to your door.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-white font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3 text-white/80 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span>info@cheezybite.lk</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-white font-semibold text-lg">Opening Hours</h3>
            <div className="space-y-2 text-white/80 text-sm">
              <p>Monday - Friday: 10:00 AM - 11:00 PM</p>
              <p>Saturday - Sunday: 11:00 AM - 12:00 AM</p>
              <p className="text-secondary font-medium">🚚 Delivery available island-wide</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-white/60 text-sm">
            © 2025 CheezyBite. All rights reserved. | Made with ❤️ in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
