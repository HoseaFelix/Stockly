import RegistrationForm from "../../components/RegistrationForm";
import Link from "next/link";
import { Leaf } from "lucide-react";

export const metadata = { title: "Pre-register | GROCERLY", description: "Tell us what would make grocery shopping easier in Osogbo." };

export default function PreRegisterPage() {
  return <main className="form-page"><header className="form-header"><Link href="/" className="brand"><span className="brand-mark"><Leaf size={18} fill="currentColor"/></span><span>grocerly<span className="brand-dot">.</span></span></Link><span>Osogbo, Osun State <span aria-hidden="true">✳</span></span></header><RegistrationForm/></main>;
}
