import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from 'lucide-react';
import SupportCard from './SupportCard';

const Footer = () => {
  return (
    <footer className="bg-charcoalBlack bg-pattern py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/">
              <Image src="/logo.svg" width={160} height={160} alt="CheezyBite" />
            </Link>
            <p className="text-ashWhite/80 text-sm text-center md:text-left max-w-xs">
              Sri Lanka's favorite pizza destination. Fresh ingredients, authentic flavors, delivered hot to your door.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <SupportCard compact={true} />
            <div className="flex items-center gap-3 mt-4 text-ashWhite/60 text-xs">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>Colombo, Sri Lanka</span>
            </div>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-ashWhite font-semibold text-lg">Opening Hours</h3>
            <div className="space-y-2 text-ashWhite/80 text-sm">
              <p>Monday - Friday: 10:00 AM - 11:00 PM</p>
              <p>Saturday - Sunday: 11:00 AM - 12:00 AM</p>
              <p className="text-secondary font-medium">🚚 Delivery available island-wide</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-cardBorder mt-8 pt-6 text-center">
          <p className="text-ashWhite/60 text-sm">
            © 2025 CheezyBite. All rights reserved. | Made with ❤️ in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
