ListKungFu::Application.routes.draw do
  root :to => "app#welcome"

  resources :lists do
    resources :list_items
  end

  resources :list_items

  resources :tags

  devise_for :users, :controllers => { :sessions => "sessions" }

  get "app/main"
  get "app/welcome"
  get "app/redirect"

end
