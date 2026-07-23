import { Github } from "lucide-react";
import {
  APP_NAME,
  DEVELOPER_GITHUB_URL,
  DEVELOPER_NAME,
  SITE_URL
} from "../lib/siteLinks.js";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__line">
          <a className="site-footer__link" href={SITE_URL}>
            {APP_NAME}
          </a>
          <span className="site-footer__sep" aria-hidden="true">
            ·
          </span>
          <a
            className="site-footer__link site-footer__dev-link"
            href={DEVELOPER_GITHUB_URL}
            rel="noopener noreferrer"
            target="_blank"
            aria-label={`${DEVELOPER_NAME} on GitHub`}
          >
            <Github className="site-footer__github-icon" size={14} strokeWidth={2} aria-hidden="true" />
            {DEVELOPER_NAME}
          </a>
        </p>
      </div>
    </footer>
  );
}
