#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

const code = Deno.args[0]

if (!code) throw `unknown code`

const code2timezone =
	{ 'japan': 'Asia/Tokyo'
	, 'taiwan': 'Asia/Taipei'
	, 'korea': 'Asia/Seoul'
	, 'pre-trip': 'America/New_York'
	, 'return-trip': 'America/Los_Angeles'
	}

const timezone = code2timezone[code]

if (!timezone) throw `idk that timezone`

import { serve } from "https://deno.land/std@0.178.0/http/server.ts";

serve(async req => {
	const fs = await req.json()

	const changes = fs.map(f => [`/mnt/d/imges/${f}`, `pics/${f}`])

	changes.push(...fs.map(f => [`/mnt/d/imges/${f}`, `media/${f}`]))

	try{
	await Promise.all(changes.map(xs => Deno.copyFile(...xs)))
	}catch(e) {
		console.log('failed oops!!')
	}

	console.log(changes)

	return new Response(JSON.stringify(timezone), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
})
