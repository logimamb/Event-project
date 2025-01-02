'use client';

import { useState, useEffect } from 'react';
import { Check, Mail, Phone, Search, UserPlus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  blocked: boolean;
  hidden: boolean;
}

interface ContactSelectorProps {
  onSelect: (contacts: Contact[], method: 'EMAIL' | 'SMS') => void;
}

export function ContactSelector({ onSelect }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendMethod, setSendMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data.contacts.filter((c: Contact) => !c.blocked && !c.hidden));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.includes(searchQuery)
    );
  });

  const toggleContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact",
        variant: "destructive",
      });
      return;
    }

    // Validate contacts based on send method
    const invalidContacts = selectedContacts.filter(contact => {
      if (sendMethod === 'EMAIL' && !contact.email) return true;
      if (sendMethod === 'SMS' && !contact.phone) return true;
      return false;
    });

    if (invalidContacts.length > 0) {
      toast({
        title: "Invalid contacts",
        description: `Some contacts don't have ${sendMethod === 'EMAIL' ? 'email addresses' : 'phone numbers'}`,
        variant: "destructive",
      });
      return;
    }

    onSelect(selectedContacts, sendMethod);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Button variant="outline" size="icon">
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="email" onValueChange={(v) => setSendMethod(v as 'EMAIL' | 'SMS')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`flex items-center justify-between p-2 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 ${
                  selectedContacts.some(c => c.id === contact.id) ? 'bg-primary/10' : ''
                }`}
                onClick={() => toggleContact(contact)}
              >
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  {contact.email && (
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  )}
                </div>
                {selectedContacts.some(c => c.id === contact.id) ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : null}
              </div>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sms">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`flex items-center justify-between p-2 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 ${
                  selectedContacts.some(c => c.id === contact.id) ? 'bg-primary/10' : ''
                }`}
                onClick={() => toggleContact(contact)}
              >
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  {contact.phone && (
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  )}
                </div>
                {selectedContacts.some(c => c.id === contact.id) ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : null}
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
        </p>
        <Button onClick={handleSubmit}>
          Send Invites
        </Button>
      </div>
    </div>
  );
}
