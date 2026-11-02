import RegistrationForm from "../../components/RegistrationForm";
import Link from "next/link";
import Image from "next/image";
import { Leaf } from "lucide-react";

export const metadata = { title: "Pre-register | STOCKLY", description: "Tell us what would make grocery shopping easier in Osogbo." };

export default function PreRegisterPage() {
  return <main className="form-page"><header className="form-header"><Link href="/" className="brand"><Image className="brand-logo" src="/stockly-icon.png" alt="" width={36} height={36}/><span>Stockly</span></Link><span>Osogbo, Osun State <span aria-hidden="true">✳</span></span></header><RegistrationForm/></main>;
}
