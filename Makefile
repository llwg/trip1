.PHONY: pre-trip japan taiwan korea index all

pre-trip:
	pandoc -s --filter ./filter.js -c "style.css" "pre-trip.md" -o "pre-trip.html"
japan:
	pandoc -s --filter ./filter.js -c "style.css" "japan.md" -o "japan.html"
taiwan:
	pandoc -s --filter ./filter.js -c "style.css" "taiwan.md" -o "taiwan.html"
korea:
	pandoc -s --filter ./filter.js -c "style.css" "korea.md" -o "korea.html"
conclusions:
	pandoc -s --filter ./filter.js -c "style.css" "conclusions.md" -o "conclusions.html"
index:
	pandoc -s -c style.css index.md -o index.html

all:
	make pre-trip japan taiwan korea conclusions index
clean:
	rm -f pre-trip.html japan.html taiwan.html korea.html conclusions.html index.html img_counts.json
