#!/usr/bin/env -S deno run --allow-read --allow-write

import { readAll } from "https://deno.land/std@0.182.0/streams/read_all.ts";
const slurp_stdin = _ => readAll(Deno.stdin).then(b => new TextDecoder().decode(b))

const j = JSON.parse(await slurp_stdin())

const ri = html => ({ t: 'RawInline', c: ['html', html] })
const str = str => ({ t: 'Str', c: str })

const img_counts = {}

const handlers = {
	Link: ({ tree: { c }, currHead }) => {
		const [_, [...basething], [explain]] = c

		console.error(c)

		return { needFlat: true, currHead, tree: [ ri('<ruby>'), ...basething, ri('<rt>'), str(decodeURIComponent(explain)), ri('</rt>'), ri('</ruby>') ]}
	}

	, Str: ({ tree, currHead }) => tree.c === '->'
		? ({ tree: str('→'), currHead })
		: ({ tree, currHead })

	, Header: ({ tree, currHead }) => {
		const level = tree.c[0] // :)
		const id = tree.c[1][0]

		if (level == 2) return { tree, currHead: id }
		else return { tree, currHead }
	}
	, Image: ({ currHead, tree }) => {
		img_counts[currHead] ??= 0
		img_counts[currHead] += 1
		// console.error(tree)
		const { t, c: [a, b, [x, y]]} = tree
		// console.error({ tree: {t, c: [a, b, [x.replace(/^pics\/(.+)\.jpg$/, 'media/$1.webp'), y]]}, currHead })
		return { tree: {t, c: [a, b, [x.replace(/^pics\/(.+)\.(jpg|png)$/, 'media/$1.webp').replace(/^pics\/(.+\.webm)/, 'media/$1'), y]]}, currHead }
	}
}

const allt = new Set()

const hehe = x => {

	let { tree, currHead } = x

	if (typeof(tree) !== 'object') {
		return { tree, currHead }
	}

	if (Array.isArray(tree)) {
		const res = []
		for (const t of tree) {
			const { tree: tres, needFlat, currHead: newhead } = hehe({ tree: t, currHead })
			currHead = newhead
			if (needFlat)
				res.push(...tres)
			else
				res.push(tres)
		}
		return { tree: res, currHead }
	}

	// console.error(tree)

	const { t, c } = tree

	allt.add(t)

	// const h = handlers[t]
	// if (h) {
	// 	tree = h(x)
	// 	console.error('changed', tree)
	// }

	let recurse = null

	if (c) {
		const { tree: res, currHead: resHead } = hehe({ tree: c, currHead })
		recurse =  { tree: { t, c: res }, currHead: resHead }
	} else {
		recurse =  { tree, currHead }
	}

	const h = handlers[t]
	return h ? h(recurse) : recurse
}

// await Deno.writeTextFile('out.json', JSON.stringify(j, null, '\t'))


// console.error(j.blocks.map(tree => hehe({ tree, currHead: 'idk' })))

// j.blocks = j.blocks.map(transform)
// j.blocks = j.blocks.map(tree => hehe({ tree, currHead: 'idk' })).map(({tree}) => tree)

j.blocks = hehe({ tree: j.blocks, currHead: 'hehehh' }).tree

// console.error(hehe({tree: j.blocks[0]}))

console.error(allt)

// await Deno.writeTextFile('transf.json', new Date() + JSON.stringify(j, null, '\t'))

const IFILE = 'img_counts.json'

try {
	const counts = JSON.parse(await Deno.readTextFile(IFILE))
	await Deno.writeTextFile(IFILE, JSON.stringify({...counts, ...img_counts},null,'\t'))
} catch (_) {
	await Deno.writeTextFile(IFILE, JSON.stringify(img_counts,null,'\t'))
}

console.error(img_counts)
console.error(Object.values(img_counts).reduce((a, b) => a+b, 0))

console.log(JSON.stringify(j))