/**
 * Proxy API pour contourner les problèmes CORS en développement
 * Route: /api/donations
 * 
 * Ce proxy récupère le token Firebase depuis le header Authorization
 * et le transmet à l'API de paiement
 */

import { NextRequest, NextResponse } from "next/server";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_DONATIONS_API_URL || "";

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Proxy: Token manquant dans le header Authorization");
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("✅ Proxy: Token reçu, longueur:", token.length);

    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(req.url);
    const parishId = searchParams.get("parishId");
    const dioceseId = searchParams.get("dioceseId");

    // Construire l'URL de l'API de paiement
    const params = new URLSearchParams();
    if (parishId) params.append("parishId", parishId);
    if (dioceseId) params.append("dioceseId", dioceseId);

    const apiUrl = `${PAYMENT_API_URL}/admin/payments?${params.toString()}`;
    console.log("📡 Proxy: Appel API:", apiUrl);

    // Faire la requête à l'API de paiement
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("📊 Proxy: Réponse API:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Proxy: Erreur API:", response.status, errorText);
      
      // Si c'est une erreur 401, le problème vient probablement de la vérification du token
      if (response.status === 401) {
        console.error("💡 Le token Firebase n'est peut-être pas valide pour le projet configuré dans payment-api");
        console.error("💡 Vérifiez que FIREBASE_PROJECT_ID dans payment-api correspond à 'samaquete-admin-new'");
      }
      
      return NextResponse.json(
        { error: `API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Proxy: Données reçues de l'API:", {
      totalPayments: data.payments?.length || 0,
      total: data.total
    });

    // Retourner les données avec les headers CORS appropriés
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("❌ Erreur proxy donations:", error);
    return NextResponse.json(
      { error: "Erreur serveur", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
