import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settings';

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  whatsApp: string;
  image: string;
}

export interface OrgSettings {
  orgName: string;
  orgEmail: string;
  orgAbout: string; // The raw or processed string
  orgLogo: string;
  orgPhone?: string;
  orgAddress?: string;

  // New Public Content Fields
  vision: string;
  mission: string;
  motto: string;

  // New Leadership Fields (Decoded dynamically from orgAbout if it contains JSON)
  directorName: string;
  directorRole: string;
  directorQuote: string;
  directorBio?: string;
  directorEmail: string;
  directorWhatsApp: string;
  directorImage: string;
  teamMembers: TeamMember[];

  // Social Links
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;

  // KoBoToolbox Form Connection
  koboApiUrl?: string;
  koboToken?: string;
  koboFormId?: string;
}

interface OrgSettingsContextType {
  settings: OrgSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (data: Partial<OrgSettings>) => Promise<void>;
}

export const defaultDirector = {
  name: 'Pastor Richie Mkandawire',
  role: 'Senior Pastor & Founder',
  quote: `Welcome to New Nature In Christ Ministry (NNCM). Pastor Richie founded New Nature In Christ Ministry with a burning desire to see lives transformed by the power of the Holy Spirit, teaching the uncompromised word of God, raising a Christ-minded generation, and shepherding believers into their fullness in Christ Jessus.`,
  email: 'richiefa88@gmail.com',
  whatsApp: '+265882404093',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
};

const defaultSettings: OrgSettings = {
  orgName: 'New Nature In Christ Ministry',
  orgEmail: 'richiefa88@gmail.com',
  orgAbout: 'The church is a Pentecostal church fully relying on the Holy Spirit and His ministration. The purpose of the church is to preach and teach the word of God and make disciples of Jesus Christ who will belong to planted and established self-supporting churches.',
  orgLogo: '/logo.png', // Fallback or clear logo reference
  orgPhone: '+265 882404093',
  orgAddress: 'Zomba, Malawi',
  vision: 'To reach the whole world with the word of Christ Jesus, and systematic preaching and teaching the word of God in the power of the Holy Spirit, and ensuring that our members are living according to God’s original plan.',
  mission: 'Preaching and teaching Christ where the name of the Lord has never been heard (Romans 15:20)',
  motto: 'NNC- Christ minded generation',
  directorName: defaultDirector.name,
  directorRole: defaultDirector.role,
  directorQuote: defaultDirector.quote,
  directorBio: defaultDirector.quote,
  directorEmail: defaultDirector.email,
  directorWhatsApp: defaultDirector.whatsApp,
  directorImage: defaultDirector.image,
  teamMembers: [
    {
      name: 'Pastor Mercy Mkandawire',
      role: 'First Lady & Women Ministry Director',
      email: 'mercy@nncm-church.org',
      whatsApp: '+265882404093',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Pastor Caleb Banda',
      role: 'Worship Lead & Youth Pastor',
      email: 'pastor.caleb@nncm-church.org',
      whatsApp: '+265888200100',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    {
      name: 'Sister Sandra Phiri',
      role: 'Church Admin & Finance Officer',
      email: 'admin@nncm-church.org',
      whatsApp: '+265999444555',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
    }
  ],
  facebookUrl: 'https://facebook.com/new_nature_in_christ_ministry',
  twitterUrl: 'https://twitter.com/new_nature_in_christ_ministry',
  youtubeUrl: 'https://youtube.com/new_nature_in_christ_ministry',
  instagramUrl: 'https://instagram.com/new_nature_in_christ_ministry',
  koboApiUrl: '',
  koboToken: '',
  koboFormId: '',
};

const OrgSettingsContext = createContext<OrgSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const parseAboutAndLeadership = (rawAbout: any) => {
  if (!rawAbout) {
    return {
      aboutText: defaultSettings.orgAbout,
      directorName: defaultDirector.name,
      directorRole: defaultDirector.role,
      directorQuote: defaultDirector.quote,
      directorBio: defaultDirector.quote,
      directorEmail: defaultDirector.email,
      directorWhatsApp: defaultDirector.whatsApp,
      directorImage: defaultDirector.image,
      vision: defaultSettings.vision,
      mission: defaultSettings.mission,
      motto: defaultSettings.motto,
      teamMembers: [],
    };
  }

  try {
    const rawAboutStr = typeof rawAbout === 'string' ? rawAbout : JSON.stringify(rawAbout);
    const trimmed = rawAboutStr.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return {
          aboutText: parsed.aboutText || defaultSettings.orgAbout,
          directorName: parsed.directorName || defaultDirector.name,
          directorRole: parsed.directorRole || defaultDirector.role,
          directorQuote: parsed.directorQuote || defaultDirector.quote,
          directorBio: parsed.directorBio || parsed.directorQuote || defaultDirector.quote,
          directorEmail: parsed.directorEmail || defaultDirector.email,
          directorWhatsApp: parsed.directorWhatsApp || defaultDirector.whatsApp,
          directorImage: parsed.directorImage || defaultDirector.image,
          vision: parsed.vision || defaultSettings.vision,
          mission: parsed.mission || defaultSettings.mission,
          motto: parsed.motto || defaultSettings.motto,
          teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [],
        };
      }
    }
  } catch (e) {
    // rawAbout was not valid JSON, treat it as normal text about description
  }

  return {
    aboutText: rawAbout,
    directorName: defaultDirector.name,
    directorRole: defaultDirector.role,
    directorQuote: defaultDirector.quote,
    directorBio: defaultDirector.quote,
    directorEmail: defaultDirector.email,
    directorWhatsApp: defaultDirector.whatsApp,
    directorImage: defaultDirector.image,
    vision: defaultSettings.vision,
    mission: defaultSettings.mission,
    motto: defaultSettings.motto,
    teamMembers: [],
  };
};

export const OrgSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<OrgSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const updateSettings = async (data: Partial<OrgSettings>) => {
    try {
      await settingsService.updateSettings(data);
      await fetchSettings();
    } catch (err) {
      console.error('Update settings failed:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      if (data) {
        const rawAbout = data.orgAbout || '';
        const decoded = parseAboutAndLeadership(rawAbout);

        setSettings({
          orgName: data.orgName || data.organizationName || defaultSettings.orgName,
          orgEmail: data.orgEmail || data.email || defaultSettings.orgEmail,
          orgAbout: decoded.aboutText,
          orgLogo: data.orgLogo || data.organizationLogo || defaultSettings.orgLogo,
          orgPhone: data.orgPhone || data.phone || defaultSettings.orgPhone,
          orgAddress: data.orgAddress || data.address || defaultSettings.orgAddress,
          directorName: decoded.directorName,
          directorRole: decoded.directorRole,
          directorQuote: decoded.directorQuote,
          directorBio: decoded.directorBio,
          directorEmail: decoded.directorEmail,
          directorWhatsApp: decoded.directorWhatsApp,
          directorImage: decoded.directorImage,
          vision: data.vision || decoded.vision,
          mission: data.mission || decoded.mission,
          motto: data.motto || decoded.motto,
          teamMembers: decoded.teamMembers,
          facebookUrl: data.facebookUrl || defaultSettings.facebookUrl,
          twitterUrl: data.twitterUrl || defaultSettings.twitterUrl,
          youtubeUrl: data.youtubeUrl || defaultSettings.youtubeUrl,
          instagramUrl: data.instagramUrl || defaultSettings.instagramUrl,
          koboApiUrl: data.koboApiUrl || defaultSettings.koboApiUrl,
          koboToken: data.koboToken || defaultSettings.koboToken,
          koboFormId: data.koboFormId || defaultSettings.koboFormId,
        });
      }
    } catch (error) {
      console.warn("Could not fetch org settings, using defaults:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <OrgSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </OrgSettingsContext.Provider>
  );
};

export const useOrgSettings = () => useContext(OrgSettingsContext);
