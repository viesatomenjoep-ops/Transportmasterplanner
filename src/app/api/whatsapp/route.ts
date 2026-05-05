import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { driver_id, driver_phone, ride_id } = await request.json();

    if (!driver_id || !driver_phone) {
      return NextResponse.json({ error: 'Missing driver info' }, { status: 400 });
    }

    // Heppner Enterprise WhatsApp Simulatie
    // In productie: Integratie met Twilio API voor WhatsApp / SMS.
    
    const magicLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/driver/${driver_id}`;
    
    const message = `
🚚 *Viesa Transportplanner*
Beste Chauffeur, je hebt een nieuwe rit toegewezen gekregen!
Open je unieke chauffeurs-app om direct te beginnen:
${magicLink}
    `;

    console.log(`[WHATSAPP API SIMULATION] Sending to ${driver_phone}: \n${message}`);

    // Return success to the client
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp bericht succesvol in de wachtrij gezet.',
      simulated_payload: message 
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send WhatsApp automation' }, { status: 500 });
  }
}
