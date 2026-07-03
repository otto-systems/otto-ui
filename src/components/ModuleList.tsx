type ModuleRecord = {
  id: string;
  name: string;
  version: string;
  state: string;
};

type ModuleListProps = {
  modules: ModuleRecord[];
};

export function ModuleList({ modules }: ModuleListProps) {
  return (
    <div className="stacked-list">
      {modules.map((module) => (
        <article key={module.id} className="stacked-item">
          <div>
            <p className="item-title">{module.name}</p>
            <p className="item-subtitle">{module.id}</p>
          </div>
          <div className="item-meta">
            <span>{module.version}</span>
            <span>{module.state}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
