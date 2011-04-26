ListKungFu::Application.routes.draw do
  root :to => "app#welcome"

  resources :lists do
    resources :list_items
  end

  resources :list_items

  resources :tags

  # use ssl in production
  if Rails.env == 'production'
    constraints :protocol => "https", :domain => 'listkungfu.heroku.com' do
      devise_for :users, :controllers => { :sessions => "sessions" }
    end
  else
    devise_for :users, :controllers => { :sessions => "sessions" }
  end

  get "app/main"
  get "app/welcome"
  get "app/redirect"

end
