"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, User, Bell, Shield, Palette, Edit, Save, X, Church, Check } from "lucide-react"

export interface SettingsScreenProps {
  setCurrentScreen: (screen: string) => void
  userProfile: {
    name: string
    phone: string
    totalDonations: number
    prayerDays: number
  }
  setUserProfile: (profile: any) => void
  selectedParish: string
}

export default function SettingsScreen({
  setCurrentScreen,
  userProfile,
  setUserProfile,
  selectedParish,
}: SettingsScreenProps) {
  /* -------------------------------------------------------------------------- */
  /*                                   STATE                                    */
  /* -------------------------------------------------------------------------- */
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(userProfile)
  const [prefs, setPrefs] = useState({
    darkMode: false,
    pushNotifications: true,
    biometricAuth: false,
  })

  /* -------------------------------------------------------------------------- */
  /*                              HANDLER FUNCTIONS                             */
  /* -------------------------------------------------------------------------- */
  const handleTogglePref = (key: keyof typeof prefs) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSaveProfile = () => {
    setUserProfile(editedProfile)
    setIsEditing(false)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50"
    >
      {/* ------------------------------- Header -------------------------------- */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("dashboard")}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Paramètres</h2>
            <p className="text-gray-200">Personnalisez votre expérience</p>
          </div>
        </div>

        {/* -------- Profile summary / edit button ---------- */}
        <Card className="bg-white/20 backdrop-blur-sm border-0 p-4 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-white">
              <div className="font-bold text-lg">{userProfile.name || "Votre nom"}</div>
              <div className="text-gray-200 text-sm">{userProfile.phone || "Votre téléphone"}</div>
              <div className="flex items-center text-gray-200 text-sm mt-1">
                <Church className="w-4 h-4 mr-1" />
                {selectedParish || "Paroisse non définie"}
              </div>
            </div>

            {isEditing ? (
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full p-2"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full p-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="p-6 -mt-4 space-y-6">
        {/* ------------------------- Profile editing card ------------------------ */}
        {isEditing && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-6 rounded-2xl space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg">Modifier le profil</h3>

              <div className="space-y-3">
                <Input
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  placeholder="Nom complet"
                  className="h-11"
                />
                <Input
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  placeholder="Téléphone"
                  className="h-11"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg">
                  Annuler
                </Button>
                <Button onClick={handleSaveProfile} className="rounded-lg">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* --------------------------- Preferences ----------------------------- */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg mb-2">Préférences</h3>

          {/* Dark Mode */}
          <PreferenceRow
            icon={Palette}
            title="Mode sombre"
            description="Améliore le confort visuel"
            active={prefs.darkMode}
            toggle={() => handleTogglePref("darkMode")}
          />

          {/* Push Notifications */}
          <PreferenceRow
            icon={Bell}
            title="Notifications push"
            description="Recevez des alertes en temps réel"
            active={prefs.pushNotifications}
            toggle={() => handleTogglePref("pushNotifications")}
          />

          {/* Biometric */}
          <PreferenceRow
            icon={Shield}
            title="Authentification biométrique"
            description="Déverrouillez l'app avec Touch/Face ID"
            active={prefs.biometricAuth}
            toggle={() => handleTogglePref("biometricAuth")}
          />
        </Card>
      </div>
    </motion.div>
  )
}

/* -------------------------- Preference Row component ------------------------- */
interface PrefRowProps {
  icon: typeof User
  title: string
  description: string
  active: boolean
  toggle: () => void
}

function PreferenceRow({ icon: Icon, title, description, active, toggle }: PrefRowProps) {
  return (
    <div
      onClick={toggle}
      className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition
        ${active ? "bg-amber-50 border border-amber-300" : "bg-gray-50 hover:bg-gray-100"}
      `}
    >
      <Icon className="w-6 h-6 text-gray-600" />
      <div className="flex-1">
        <div className="font-medium text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      {active && (
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}
