class ListsController < ApplicationController

	before_filter :authenticate_user!

  respond_to :xml
  
  def index
    @lists = List.where( "owner_id = :user_id", { :user_id => current_user.id } ).order( "created_at desc" )
    respond_with(@lists)
  end

  def show
    @list = List.where( "owner_id = :user_id and list_id = :id", { :user_id => current_user.id, :id => params[:id] } )
    respond_with(@list)
  end

  def new
    @list = List.new

    respond_with( @list ) do |format|
      format.js
    end
  end

  def edit
    @list = List.find(params[:id])

    respond_with( @list ) do |format|
      format.js
    end
  end

  def create
    @list = List.new(params[:list])
    @list.owner = current_user

    if @list.save
      flash[:notice] = 'List has been created.'
    end
    
    respond_with( @list )
  end

  def update
    @list = List.find(params[:id])
    if @list.update_attributes(params[:list])
      flash[:notice] = 'List has been updated.'
    end
    
    respond_with( @list )
  end

  def destroy
    @list = List.find( params[:id] )
    @list.destroy
    
    respond_with( @list )
  end
end
