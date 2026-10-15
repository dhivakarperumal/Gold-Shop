import { Link } from "react-router-dom";

const PageHeader = ({
  title,
  eyebrow,
  subtitle,
  description,
  breadcrumb,
  className = "",
  contentClassName = "",
  titleClassName = "",
  action,
  children,
}) => {
  if (breadcrumb || eyebrow || subtitle || description || action || children) {
    return (
      <section
        className={`relative overflow-hidden bg-cover bg-center text-white ${className}`}
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(48, 5, 7, .28), rgba(48, 5, 7, .08) 55%, transparent), url("/page-header-banner.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "300px",
          minHeight: "300px",
          maxHeight: "300px",
        }}
      >
        <div className={`mx-auto grid w-full max-w-[1700px] items-center gap-6 px-[6%] py-5 sm:px-[5%] lg:px-[3%] ${children ? "sm:grid-cols-[1.3fr_1fr]" : "grid-cols-1"} ${contentClassName}`}>
          <div>
            {breadcrumb && (
              <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                <Link to="/" className="text-[#f1bf54] transition-colors hover:text-white">Home</Link>
                <span aria-hidden="true">›</span>
                <span aria-current="page">{breadcrumb}</span>
              </nav>
            )}
            {eyebrow && <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#f4c35e]">{eyebrow}</p>}
            <h1 className={`mt-1 max-w-2xl font-serif font-bold leading-tight text-[#f8dfa0] ${titleClassName || "text-3xl sm:text-4xl lg:text-5xl"}`}>
              {title}
            </h1>
            {subtitle && (
              <div className="mt-2 max-w-2xl">
                <div className="mb-1 flex max-w-[280px] items-center gap-2 text-[#f1bf54]" aria-hidden="true">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f1bf54]" />
                  <span className="text-sm">✧</span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f1bf54]" />
                </div>
                <p className="font-serif text-sm font-semibold leading-tight text-[#f8dfa0] sm:text-lg">{subtitle}</p>
              </div>
            )}
            {description && <p className="mt-2 max-w-2xl text-[11px] leading-5 text-white/90 sm:text-sm">{description}</p>}
            {action && <div className="mt-3">{action}</div>}
            {!subtitle && <div className="mt-4 h-px w-24 bg-[#f1bf54]" />}
          </div>
          {children && <div className="relative z-10">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <div
      className="relative flex h-[300px] w-full items-end justify-center overflow-hidden text-white"
      style={{
        backgroundImage: 'url("/page-header-banner.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Bottom gold line */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[#d5a65a]"></div>

      {/* Bottom Content */}
      <div className="relative z-10 w-full px-4 pb-7 text-center sm:pb-8 md:pb-9">
        
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#edc783] sm:mb-3">
          Q Frame Studio
        </p>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/80 sm:mt-3 sm:text-sm">
          <Link
            to="/"
            className="transition hover:text-[#edc783]"
          >
            Home
          </Link>

          <span>/</span>

          <span className="text-white">
            {title}
          </span>
        </div>

      </div>
    </div>
  );
};

export default PageHeader;