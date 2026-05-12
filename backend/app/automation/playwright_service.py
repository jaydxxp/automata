import os
import re
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

# pyrefly: ignore [missing-import]
from playwright.async_api import async_playwright, ElementHandle

from .event_emitter import EventEmitter

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class GoalRoute:
    

    semantic_type: str
    keywords: Tuple[str, ...]
    result_key: str


class PlaywrightService:
    def __init__(self, job_id: str, emitter: EventEmitter):
        self.job_id = job_id
        self.emitter = emitter

        self.browser = None
        self.context = None
        self.page = None

    async def run_workflow(self, url: str, goal: str):
        async with async_playwright() as p:
            try:
                await self.emitter.emit(
                    "browser.launching",
                    "Launching Chromium browser..."
                )

                self.browser = await p.chromium.launch(
                    headless=True
                )

                self.context = await self.browser.new_context()

                self.page = await self.context.new_page()

                await self.emitter.emit(
                    "browser.launched",
                    "Browser launched successfully"
                )

                await self.emitter.emit(
                    "page.navigating",
                    f"Navigating to {url}"
                )

                await self.page.goto(
                    url,
                    wait_until="domcontentloaded",
                    timeout=30000
                )

                await self.emitter.emit(
                    "page.loaded",
                    "Page loaded successfully"
                )

                goal_lower = (goal or "").lower().strip()
                route = self._route_goal(goal_lower)

                if route:
                    await self.emitter.emit(
                        "strategy.detected",
                        f"Routed goal to semantic type: {route.semantic_type}"
                    )
                    result = await self._extract_semantic(
                        semantic_type=route.semantic_type,
                        result_key=route.result_key,
                    )
                else:
                    await self.emitter.emit(
                        "strategy.fallback",
                        "No route matched; running generic discovery"
                    )
                    result = await self._discover_repeated_items(result_key="discovered_items")

         
                if "scroll" in goal_lower:
                    await self.emitter.emit(
                        "action.scroll",
                        "Scrolling page"
                    )

                    await self.page.evaluate("""
                        window.scrollTo(
                            0,
                            document.body.scrollHeight
                        )
                    """)

          
                screenshot_dir = "screenshots"
                os.makedirs(screenshot_dir, exist_ok=True)

                screenshot_path = (
                    f"{screenshot_dir}/{self.job_id}.png"
                )

                await self.emitter.emit(
                    "screenshot.capturing",
                    "Capturing screenshot"
                )

                await self.page.screenshot(
                    path=screenshot_path,
                    full_page=True
                )

                await self.emitter.emit(
                    "screenshot.captured",
                    "Screenshot captured successfully",
                    {
                        "path": screenshot_path
                    }
                )

                return result, screenshot_path

            except Exception as e:
                await self.emitter.emit(
                    "job.failed",
                    f"Automation failed: {str(e)}"
                )

                raise e

            finally:
                if self.browser:
                    await self.emitter.emit(
                        "browser.closing",
                        "Closing browser"
                    )

                    await self.browser.close()

                    await self.emitter.emit(
                        "browser.closed",
                        "Browser closed safely"
                    )

   


    def _routes(self) -> List[GoalRoute]:
        return [
            GoalRoute(
                semantic_type="product",
                result_key="products",
                keywords=("product", "products", "item", "items", "price", "pricing", "shop", "store", "buy", "sale"),
            ),
            GoalRoute(
                semantic_type="headline",
                result_key="headlines",
                keywords=("headline", "headlines", "news", "article", "articles", "story", "stories", "post", "posts"),
            ),
            GoalRoute(
                semantic_type="quote",
                result_key="quotes",
                keywords=("quote", "quotes", "author", "saying", "testimonial", "testimonials", "review", "reviews"),
            ),
            GoalRoute(
                semantic_type="link",
                result_key="links",
                keywords=("link", "links", "navigation", "menu"),
            ),
        ]

    def _route_goal(self, goal_lower: str) -> Optional[GoalRoute]:
        if not goal_lower:
            return None
        for route in self._routes():
            if any(k in goal_lower for k in route.keywords):
                return route
        return None

  

    async def _safe_text(self, container: ElementHandle, selector: str) -> Optional[str]:

        try:
            if selector.strip() == ":scope" or selector.strip() == "":
                element = container
            else:
                element = await container.query_selector(selector)

            if not element:
                return None

            text = await element.inner_text()

            if text:
                cleaned = self._clean_text(text)
                if cleaned:
                    return cleaned

            title = await element.get_attribute("title")

            if title:
                cleaned = self._clean_text(title)
                if cleaned:
                    return cleaned

        except Exception:
            return None

        return None

    def _clean_text(self, text: str) -> Optional[str]:
        if not text:
            return None
        cleaned = re.sub(r"\s+", " ", text).strip()
        cleaned = cleaned.strip("\u201c\u201d\u2018\u2019\"'")
        if len(cleaned) < 2:
            return None
        return cleaned

    async def _safe_attr(self, container: ElementHandle, selector: str, attr: str) -> Optional[str]:

        try:
            if selector.strip() == ":scope" or selector.strip() == "":
                element = container
            else:
                element = await container.query_selector(selector)

            if not element:
                return None

            value = await element.get_attribute(attr)

            if not value:
                return None

            value = value.strip()

            if attr == "href" and value.startswith("/"):
                base = "/".join(
                    self.page.url.split("/")[:3]
                )

                value = f"{base}{value}"

            return value

        except Exception:
            return None

 

    _SEMANTIC_CONTAINER_SELECTORS: Tuple[str, ...] = (
        "article",
        "section",
        "li",
        "tr",
        "blockquote",
        "[role=article]",
        "[role=listitem]",
        "[class*='card' i]",
        "[class*='item' i]",
        "[class*='result' i]",
        "[class*='listing' i]",
        "[class*='entry' i]",
        "[class*='post' i]",
        "[class*='article' i]",
        "[class*='story' i]",
        "[class*='product' i]",
        "[class*='quote' i]",
        "[class*='box' i]",
    )

    _NOISE_ANCESTOR_SELECTORS: Tuple[str, ...] = (
        "header",
        "footer",
        "nav",
        "aside",
        "form",
        "[role=banner]",
        "[role=navigation]",
        "[role=contentinfo]",
        "[aria-hidden='true']",
    )

    _PRICE_RE = re.compile(r"([$€£₹]\s?\d+(?:[.,]\d+)?)")

    async def _extract_semantic(self, semantic_type: str, result_key: str) -> Dict[str, Any]:
        await self.emitter.emit(
            "extraction.started",
            f"Starting semantic extraction: type={semantic_type}"
        )

        candidates = await self._find_repeated_container_candidates(self._SEMANTIC_CONTAINER_SELECTORS)
        if not candidates:
            await self.emitter.emit("container.failed", "No repeated container candidates found")
            return await self._discover_repeated_items(result_key="discovered_items")

        best = candidates[0]
        await self.emitter.emit(
            "container.detected",
            f"Selected container selector: {best['selector']} (count={best['count']}, score={best['score']:.2f})",
        )

        items: List[Dict[str, Any]] = []
        for idx, el in enumerate(best["elements"][:40]):
            data = await self._extract_item_fields(el, semantic_type)
            if data:
                items.append(data)
            if idx < 3:
                preview = data.get("title") or data.get("text") or data.get("url") or "(empty)"
                await self.emitter.emit("extraction.progress", f"Item {idx + 1} preview: {str(preview)[:80]}")

        items = self._dedupe_items(items, primary_keys=("url", "title", "text"))

        await self.emitter.emit("extraction.completed", f"Extracted {len(items)} items for {semantic_type}")
        return {result_key: items}

    async def _find_repeated_container_candidates(self, selectors: Tuple[str, ...]) -> List[Dict[str, Any]]:
        candidates: List[Dict[str, Any]] = []
        seen: set = set()

        for selector in selectors:
            if selector in seen:
                continue
            seen.add(selector)

            try:
                elements = await self.page.query_selector_all(selector)
            except Exception:
                continue

            if len(elements) < 3:
                continue

            scored = await self._score_container_group(selector, elements)
            if scored is None:
                continue
            candidates.append(scored)

        candidates.sort(key=lambda c: (c["score"], c["count"]), reverse=True)
        if candidates[:3]:
            top = ", ".join([f"{c['selector']}:{c['score']:.1f}/{c['count']}" for c in candidates[:3]])
            await self.emitter.emit("container.scored", f"Top candidates: {top}")
        return candidates

    async def _score_container_group(self, selector: str, elements: List[ElementHandle]) -> Optional[Dict[str, Any]]:
       
        sample = elements[: min(12, len(elements))]

        try:
           
            noise_hits = 0
            for el in sample:
                if await self._is_noise_container(el):
                    noise_hits += 1
            if noise_hits / max(1, len(sample)) > 0.6:
                return None

            heading_hits = 0
            link_hits = 0
            price_hits = 0
            text_len_total = 0
            distinct_texts: set = set()

            for el in sample:
                text = await el.inner_text()
                cleaned = self._clean_text(text) or ""
                text_len_total += len(cleaned)
                if cleaned:
                    distinct_texts.add(cleaned[:160])

                if await el.query_selector("h1,h2,h3,h4"):
                    heading_hits += 1

                a = await el.query_selector("a[href]")
                if a:
                    link_hits += 1

                if cleaned and self._PRICE_RE.search(cleaned):
                    price_hits += 1

            count = len(elements)
            sample_n = len(sample)
            diversity = len(distinct_texts) / max(1, sample_n)
            avg_text_len = text_len_total / max(1, sample_n)

            score = 0.0
            score += min(count, 60) * 0.6
            score += (heading_hits / max(1, sample_n)) * 20.0
            score += (link_hits / max(1, sample_n)) * 12.0
            score += (price_hits / max(1, sample_n)) * 10.0
            score += min(avg_text_len, 300) * 0.02
            score += diversity * 10.0

            return {
                "selector": selector,
                "elements": elements,
                "count": count,
                "score": score,
            }
        except Exception:
            return None

    async def _is_noise_container(self, el: ElementHandle) -> bool:
        try:
            for noise_sel in self._NOISE_ANCESTOR_SELECTORS:

                has = await el.evaluate(
                    """(node, sel) => {
                        try { return !!node.closest(sel); } catch (e) { return false; }
                    }""",
                    noise_sel,
                )
                if has:
                    return True
        except Exception:
            return False
        return False

    async def _extract_item_fields(self, el: ElementHandle, semantic_type: str) -> Optional[Dict[str, Any]]:
        if await self._is_noise_container(el):
            return None

        if semantic_type == "link":
            tag = None
            try:
                tag = (await el.evaluate("(n) => n.tagName")) or None
            except Exception:
                tag = None

            if tag and str(tag).lower() == "a":
                url = await self._safe_attr(el, ":scope", "href")
                text = self._clean_text(await el.inner_text() or "")
            else:
                url = await self._safe_attr(el, "a[href]", "href")
                text = await self._safe_text(el, "a")
            item = self._finalize_item({"url": url, "text": text}, semantic_type)
            return item


        title = await self._first_text(el, ("a[title]", "h1", "h2", "h3", "h4", "[class*='title' i]", "a", "[aria-label]"))
        url = await self._safe_attr(el, "a[href]", "href")
        description = await self._first_text(el, ("p", "[class*='summary' i]", "[class*='excerpt' i]", "[class*='desc' i]"))

        if semantic_type == "product":
            price = await self._extract_price(el)
            availability = await self._first_text(el, ("[class*='stock' i]", "[class*='avail' i]", "[class*='status' i]"))
            return self._finalize_item(
                {"title": title, "url": url, "price": price, "availability": availability, "description": description},
                semantic_type,
            )

        if semantic_type == "headline":
            return self._finalize_item({"title": title, "url": url, "description": description}, semantic_type)

        if semantic_type == "quote":
   
            q_el = None
            try:
                q_el = await el.query_selector("blockquote, q")
            except Exception:
                q_el = None

            if q_el:
                try:
                    q = self._clean_text(await q_el.inner_text() or "")
                except Exception:
                    q = None
            else:
                q = await self._first_text(el, ("blockquote", "q", "[itemprop='text']", "[class*='text' i]", "p", "span", ":scope"))
            author = await self._first_text(el, ("cite", "small", "[itemprop='author']", "[class*='author' i]", "[rel='author']"))
        
            return self._finalize_item({"text": q, "author": author, "url": url}, semantic_type)

        return self._finalize_item({"title": title, "url": url, "description": description}, semantic_type)

    async def _first_text(self, el: ElementHandle, selectors: Tuple[str, ...]) -> Optional[str]:
        for sel in selectors:
           
            if sel == "[aria-label]":
                try:
                    v = await el.get_attribute("aria-label")
                    v = self._clean_text(v or "")
                    if v:
                        return v
                except Exception:
                    continue
            t = await self._safe_text(el, sel)
            if t:
                return t
        return None

    async def _extract_price(self, el: ElementHandle) -> Optional[str]:

        try:
            txt = self._clean_text(await el.inner_text() or "")
        except Exception:
            txt = None
        if not txt:
            return None
        m = self._PRICE_RE.search(txt)
        if not m:
            return None
        return m.group(0).strip()

    def _finalize_item(self, raw: Dict[str, Any], semantic_type: str) -> Optional[Dict[str, Any]]:

        if semantic_type == "quote" and raw.get("text") is None and isinstance(raw.get("quote"), str):
            raw = {**raw, "text": raw.get("quote")}

        item: Dict[str, Any] = {}
        for k, v in raw.items():
            if v is None:
                continue
            if isinstance(v, str):
                cv = self._clean_text(v)
                if cv:
                    item[k] = cv
            else:
                item[k] = v


        if semantic_type == "quote":
            txt = item.get("text")
            if not txt or len(txt) < 10:
                return None
            
            if txt.lower() in {"login", "sign up", "sign in", "register"}:
                return None
        elif semantic_type == "link":
            if not item.get("url"):
                return None
        else:
            if not item.get("title") and not item.get("url"):
                return None

       
        if "title" in item and len(item["title"]) < 3:
            item.pop("title", None)
            if semantic_type != "link" and not item.get("url"):
                return None

        return item if item else None

    def _dedupe_items(self, items: List[Dict[str, Any]], primary_keys: Tuple[str, ...]) -> List[Dict[str, Any]]:
        seen: set = set()
        out: List[Dict[str, Any]] = []
        for it in items:
            parts: List[str] = []
            for k in primary_keys:
                v = it.get(k)
                if isinstance(v, str) and v:
                    parts.append(v)
            key = "|".join(parts)[:500]
            if not key:
                continue
            if key in seen:
                continue
            seen.add(key)
            out.append(it)
        return out

   

    async def _discover_repeated_items(self, result_key: str) -> Dict[str, Any]:
        await self.emitter.emit("discovery.started", "Running repeated-items discovery")
        candidates = await self._find_repeated_container_candidates(self._SEMANTIC_CONTAINER_SELECTORS)

        if not candidates:
            await self.emitter.emit("discovery.failed", "No repeated structure found; returning minimal metadata")
            title = await self.page.title()
            return {"page_metadata": {"title": title, "url": self.page.url}}

        best = candidates[0]
        await self.emitter.emit(
            "discovery.detected",
            f"Discovery selected: {best['selector']} (count={best['count']}, score={best['score']:.2f})",
        )

        data: List[Dict[str, Any]] = []
        for el in best["elements"][:30]:
            title = await self._first_text(el, ("h1", "h2", "h3", "h4", "a[title]", "a", "[aria-label]"))
            url = await self._safe_attr(el, "a[href]", "href")
            snippet = await self._first_text(el, ("p", "span"))
            item = self._finalize_item({"title": title, "url": url, "snippet": snippet}, semantic_type="headline")
            if item:
                data.append(item)

        data = self._dedupe_items(data, primary_keys=("url", "title", "snippet"))
        await self.emitter.emit("discovery.completed", f"Discovered {len(data)} items")
        return {result_key: data}